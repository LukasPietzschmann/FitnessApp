/**
 * @author Lukas Pietzschmann
 */

import useCookie from './useCookie';

/**
 * useUser wraps two cookies that are necessary to authenticate a User.
 * @returns an Array containing three Elements. The Users Token, UID and a function to delete those two cookies. This function has to be called when the User gets logged out.
 */
function useUser() {
	const [token, deletToken] = useCookie('Token');
	const [uid, deletUID] = useCookie('UID');

	if (!(token && uid))
		return [null, null, () => { }]
	return [token.value, uid.value, () => {
		deletToken();
		deletUID();
	}];
}

export default useUser;