'''
Authors: Lukas Pietzschmann
'''

from dotenv import load_dotenv
from os import environ as env
from pymongo import MongoClient
from websockets.server import WebSocketServerProtocol
from asyncio import Queue
import asyncio
import websockets
import json


# This file is responsible for searching for events and distributing them to connected Clients.
# In this file all currently connected Clients are stored.
# It contains four functions that run asynchronously and each performing their own task.

load_dotenv()
client = MongoClient(env.get("MONGODB_CON_STR"))
events = client.Events.Events
users = client.GroupAndUser.User


clients = set()

# The Producer checks every two seconds if theres a new Event stored in the Database.
# If thats the case it stores the Event temporarily in a Queue and deletes it from the DB afterwards.
# If n Clients are connected and the Producer finds m Events, it generades m * n Events for the Queue,
# so distributing the event to multiple Clients can be done in parallel.
# If no Client is connected, the Producer just waits, withoud looking for new Events.
async def producer(queue: Queue):
	while True:
		if len(clients) > 0:
			all_events = list(events.find())
			for event in all_events:
				if (delCount := events.delete_one({"_id": event["_id"]}).deleted_count) != 1:
					print(f"ERROR: {delCount} Documents were deleted instead of one")
				event = json.dumps(event)
				print(f"sent msg {event}")
				for client in clients:
					await queue.put({"client": client, "event": event})
		await asyncio.sleep(2)


# The Consumer takes Events from the Queue and sends it to one Client.
async def consumer(queue: Queue):
	while True:
		work_item = await queue.get()
		await work_item["client"].send(work_item["event"])


# If no Client is connected, this function deletes all Events from the DB every 10 seconds
# so only new Events get distributed to a newly connected Client.
async def clear_events():
	while True:
		if(len(clients) == 0):
			events.delete_many({})
		await asyncio.sleep(10)


# The Handler is responsible for managing Client Connections.
# It stores new connected Clients, and removes them if they disconnect.
# A Client only gets added, if its first Message contains a UID and an associated Token.
async def handler(websocket: WebSocketServerProtocol, path):
	async def close_con():
		print(f"Client {websocket.remote_address} was disconnected, as it isnt authenticated")
		await websocket.close(code=1011, reason="The first Request has to contain the uid and a token to authenticate against")

	print(f"Client {websocket.remote_address} connected, but not authenticated")
	auth_msg = await websocket.recv()
	try:
		auth_msg = json.loads(auth_msg)
	except:
		await close_con()
		return
	if not ("token" in auth_msg and "uid" in auth_msg):
		await close_con()
		return
	res = users.find_one({"_id": auth_msg["uid"]})
	if not (res and "tokens" in res and str(auth_msg["token"]) in res["tokens"]):
		await close_con()
		return

	clients.add(websocket)
	print(f"Client {websocket.remote_address} added")
	await websocket.wait_closed()
	clients.remove(websocket)
	print(f"Client {websocket.remote_address} removed")


if __name__ == "__main__":
	event_loop = asyncio.get_event_loop()
	queue = Queue()

	event_loop.run_until_complete(websockets.serve(handler, "0.0.0.0", env.get("WEBSOCKET_PORT")))
	event_loop.run_until_complete(asyncio.gather(consumer(queue), producer(queue)))
	event_loop.run_until_complete(clear_events())
	event_loop.run_forever()