import { useEffect, useState } from 'react';

import { axiosInstance } from '../../constants';

import useUser from '../../hooks/useUser';

function AccountHeader({ className }) {
	const [token, uid, logout] = useUser();
	const [userInfo, setUserInfo] = useState(null);

	useEffect(() => {
		if (uid && token) {
			axiosInstance.get(`/user/${uid}`, { headers: { Token: token } })
				.then(({ data }) => setUserInfo(data))
				.catch(err => console.error(err));
		}
	}, [token, uid]);

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