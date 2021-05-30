from dotenv import load_dotenv
from os import environ as env
from pymongo import MongoClient
from websockets.server import WebSocketServerProtocol
from asyncio import Queue
import asyncio
import websockets
import json


load_dotenv()
client = MongoClient(env.get("MONGODB_CON_STR"))
events = client.Events.Events


clients = set()


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


async def consumer(queue: Queue):
	while True:
		work_item = await queue.get()
		await work_item["client"].send(work_item["event"])


async def clear_events():
	while True:
		if(len(clients) == 0):
			events.delete_many({})
			await asyncio.sleep(10)


async def handler(websocket: WebSocketServerProtocol, path):
	clients.add(websocket)
	print(f"Client {websocket.remote_address} added")
	await websocket.wait_closed()
	clients.remove(websocket)
	print(f"Client {websocket.remote_address} removed")


if __name__ == "__main__":
	event_loop = asyncio.get_event_loop()
	queue = Queue()

	event_loop.run_until_complete(websockets.serve(handler, "localhost", env.get("WEBSOCKET_PORT")))
	event_loop.run_until_complete(asyncio.gather(consumer(queue), producer(queue)))
	event_loop.run_until_complete(clear_events())
	event_loop.run_forever()