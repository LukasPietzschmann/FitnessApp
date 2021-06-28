/**
 * @author Lukas Pietzschmann
 */

import React from 'react';

/**
 * The Arrow Component only wraps an svg looking like an Arrow.
 * @param className The className always gets forwarded to the Top-Level Element of the Component. This enables Styling 'from outside'.
 */
function Arrow({ className }) {
	return (
		<svg className={`${className}`} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512' fill='currentColor' width='14px' height='14px'>
			<path d='M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z'/>
		</svg>
	);
}

export default Arrow;
