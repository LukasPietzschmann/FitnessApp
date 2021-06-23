/**
 * @author Lukas Pietzschmann
 */

function NotFound({ className }) {
	return (
		<div className={`text-center mt-5 ${className}`}>
			<h1 className='display-3'>404 - This Page does not exist!</h1>
			<small>Either you misspelled the url, or you are not <a href='/login'>logged in</a> and therefore do not have access to all pages.</small>
		</div>
	);
}

export default NotFound;