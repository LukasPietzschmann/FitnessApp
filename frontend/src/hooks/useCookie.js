import { useEffect, useState } from 'react';

function useCookie(cookieName) {
	const [cookies, setCookies] = useState([]);
	const [_, refresh] = useState(false);

	useEffect(() => {
		setCookies(document.cookie.split(';').map((cookie) => {
			let elems = cookie.split('=');
			return { name: elems[0].trim(), value: elems[1], args: elems.slice(2) }
		}));
	}, [_]);

	let cookie = cookies.find(elem => elem.name === cookieName);

	return [cookie, () => {
		if (cookie === undefined)
			return;
		document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
		refresh();
	}];
}

export default useCookie;