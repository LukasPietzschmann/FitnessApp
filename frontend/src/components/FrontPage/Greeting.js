/**
 * @author Lukas Pietzschmann
 */

import { useEffect, useState } from 'react';

import { axiosInstance } from '../../constants';

import useUser from '../../hooks/useUser';

function Greeting({ className }) {
	const [token, uid] = useUser();
	const [userInfo, setUserInfo] = useState(null);

	useEffect(() => {
		if (uid && token) {
			axiosInstance.get(`/user/${uid}`, { headers: { Token: token } })
				.then(({ data }) => setUserInfo(data))
				.catch(err => console.error(err));
		}
	}, [token, uid]);

	return (
		<div className={`d-flex justify-content-around ${className}`}>
			<div className='display-3'>Hello <b>{userInfo ? userInfo.uname : '...'}</b>!</div>
		</div>
	);
}

export default Greeting;