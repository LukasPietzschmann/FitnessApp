/**
 * @author Vincent Ugrai
 *
 * This File is the Entrypoint of React.
 * It specifies Components that get rendered and the HTML Element that they get rendered in.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root')
);