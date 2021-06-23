/**
 * @author Lukas Pietzschmann
 */

function useQueryParam(queryString, param) {
	if (queryString.length === 0)
		return undefined;
	const elem = queryString.substring(1).split('&').map(elem => { return { name: elem.split('=')[0], val: elem.split('=')[1] } }).filter(elem => elem.name === param)[0];
	return elem ? elem.val : undefined;
}

export default useQueryParam;