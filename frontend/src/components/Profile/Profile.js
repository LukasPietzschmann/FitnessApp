import { useEffect, useState } from 'react';

import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import Login from './Login';

function Profile({ className }) {
	const [token, uid, logout] = useUser();
	const [userInfo, setUserInfo] = useState({});

	useEffect(() => {
		if (uid && token) {
			axiosInstance.get(`/user/${uid}`, { headers: { Token: token } })
				.then(({ data }) => setUserInfo(data))
				.catch(err => console.error(err));
		}
	}, [token, uid]);

	return (
		<div className={className}>
			{
				token && uid ?
					<div>
						<h1 className='display-3'>Hello <b>{userInfo.uname}</b>!</h1>
						<form>
							<div className='form-group'>
								<label>Whole Name</label>
								<input className='form-control' placeholder='Enter your whole Name' value={userInfo.name} />
							</div>
							<div className='form-group'>
								<label>E-Mail</label>
								<input className='form-control' type='email' placeholder='Enter your E-Mail' value={userInfo.mail} />
							</div>
							<div className='form-group'>
								<label>Address</label>
								<input className='form-control' placeholder='Enter your Address' value={userInfo.address} />
							</div>
							<div className='form-group'>
								<label>Password</label>
								<input className='form-control' type='password' placeholder='Enter new Password' />
							</div>
						</form>
						<button className='btn btn-success' onClick={() => {

						}}>Save Changes</button>
						<button className='btn btn-outline-danger float-right' onClick={() => {
							axiosInstance.post(`/logout/${uid}`, null, { headers: { Token: token } })
								.then(res => {
									logout();
									window.location.href = '/login';
								})
								.catch(err => console.error(err));
						}}>Logout</button>
					</div>
					: window.location.href = '/login'
			}
		</div>
	);
}

export default Profile;