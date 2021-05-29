import useWebSocket, { ReadyState } from 'react-use-websocket';

function TestWS() {
	const {lastMessage, readyState} = useWebSocket('ws://localhost:4000');
	const connectionStatus = {
		[ReadyState.CONNECTING]: 'Connecting',
		[ReadyState.OPEN]: 'Open',
		[ReadyState.CLOSING]: 'Closing',
		[ReadyState.CLOSED]: 'Closed',
		[ReadyState.UNINSTANTIATED]: 'Uninstantiated',
	}[readyState];

	return (
		<div>
			<div>Ready: {connectionStatus}</div>
			<div>Incoming Event: {lastMessage ? lastMessage.data : ''}</div>
		</div>
	);
}

export default TestWS;