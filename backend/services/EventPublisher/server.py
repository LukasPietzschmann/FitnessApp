from dotenv import load_dotenv
from os import environ as env
from websockets.server import WebSocketServerProtocol
from asyncio import Queue
from datetime import datetime
import asyncio
import websockets


clients = set()


async def producer(queue: Queue):
	while True:
		for client in clients:
			await queue.put({"client": client, "event": str(datetime.now())})
		await asyncio.sleep(2)


async def consumer(queue: Queue):
	while True:
		work_item = await queue.get()
		await work_item["client"].send(work_item["event"])


async def handler(websocket: WebSocketServerProtocol, path):
	clients.add(websocket)
	print(f"Client {websocket.remote_address} added")
	await websocket.wait_closed()
	clients.remove(websocket)
	print(f"Client {websocket.remote_address} removed")


if __name__ == "__main__":
	load_dotenv()
	event_loop = asyncio.get_event_loop()
	events = Queue()

	event_loop.run_until_complete(websockets.serve(handler, "localhost", env.get("WEBSOCKET_PORT")))
	event_loop.run_until_complete(asyncio.gather(consumer(events), producer(events)))
	event_loop.run_forever()