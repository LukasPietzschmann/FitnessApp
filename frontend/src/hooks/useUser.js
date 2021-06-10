import useCookie from './useCookie';

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