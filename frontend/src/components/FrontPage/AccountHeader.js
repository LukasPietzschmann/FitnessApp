import { useEffect, useState } from 'react';

import { axiosInstance } from '../../constants';

import useCookie from '../../hooks/useCookie';

function AccountHeader({ className }) {
	const [token] = useCookie('Token');
	const [uid] = useCookie('UID');
	const [userInfo, setUserInfo] = useState(null);

	useEffect(() => {
		if (uid && token) {
			axiosInstance.get(`/user/${uid.value}`, { headers: { Token: token.value } })
				.then(({ data }) => setUserInfo(data))
				.catch(err => console.error(err));
		}
	}, [token]);

	if (userInfo)
		return (
			<div className={`d-flex justify-content-around ${className}`}>
				<div className='display-3'>Hello <b>{userInfo.uname}</b>!</div>
			</div>
		);
	else
		return '';
}

export default AccountHeader;