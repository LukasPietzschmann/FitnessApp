/**
 * @author Lukas Pietzschmann
 */

/**
 * useCookie is a Helper for dealing with Cookies.
 * @param cookieName the Name of the Cookie.
 * @returns an Array containing two Elements. The Value of the Cookie and a function to delete it.
 */
function useCookie(cookieName) {
	let cookies = document.cookie.split(';').map((cookie) => {
		let elems = cookie.split('=');
		return { name: elems[0].trim(), value: elems[1], args: elems.slice(2) }
	});

	let cookie = cookies.find(elem => elem.name === cookieName);

	return [cookie, () => {
		if (cookie === undefined)
			return;
		document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
	}];
}

export default useCookie;