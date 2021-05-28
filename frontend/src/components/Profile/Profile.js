import { useEffect, useState } from 'react';

import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import profilPic from '../../image/sample-profile.png';
import editPen from '../../image/editPen.png';
import Login from './Login';
import Modal from '../Modal/Modal';

function Profile({ className }) {
	const [token, uid, logout] = useUser();
	const [userInfo, setUserInfo] = useState({});
	const [logoutModal, setLogout] = useState(false);
	const [userName, setUserName] = useState('');
	const [wholeName, setWholeName] = useState('');
	const [eMail, setEMail] = useState('');
	const [adress, setAdress] = useState('');

	useEffect(() => {
		if (uid && token) {
			axiosInstance.get(`/user/${uid}`, { headers: { Token: token } })
				.then(({ data }) => setUserInfo(data))
				.catch(err => console.error(err));
		}
	}, [token, uid]);

	const [userData, setUserData] = useState(null);

	useEffect(() => {
		axiosInstance.get(`/user/${uid}`, { headers: { Token: token } })
				.then(({ data }) => setUserData(data))
				.catch(err => console.error(err));
	}, [uid, token]);


	return (
		<div className='row ml-2'>
			<Modal closeOnClickOutside={false} showModal={logoutModal} showModalHook={setLogout}>
				<h1 className='display-4 mb-3'>Are you sure?</h1>
				<button className='btn btn-success' onClick={() => {
					axiosInstance.post(`/logout/${uid}`, null, { headers: { Token: token } })
					.then(_ => {
						logout();
						window.location.href = '/login';
					})
					.catch(err => console.error(err));
				}}>Yes, logout</button>
				<button className='btn btn-danger float-right' onClick={() => setLogout(false)}>No</button>
			</Modal>

			<div className='col-auto m-4'>
				<div className='row'><img className='rounded-circle' src={userData && userData.img ? userData.img : profilPic} height='100rem' width='100rem' alt='Profile picture' style={{ objectFit: 'cover' }} />
				</div>
			</div>
			<div className='col-5 m-4'>
				<div className='row mt-3'>
					<label className=''>Username:</label>
					<div className='input-group'>
						<div className='input-group-prepend'>
							<span className='input-group-text'>@</span>
						</div>
						<input className='border form-control' placeholder={userInfo.uname} value={userName} onChange={e => setUserName(e.target.value)}/>
					</div>
				</div>
				<div className='row mt-3'>
					<label className=''>Name:</label>
					<input className='border form-control' placeholder={userInfo.name} value={wholeName} onChange={e => setWholeName(e.target.value)}/>
				</div>
				<div className='row mt-3'>
					<label className=''>E-Mail:</label>
					<input className='border form-control' placeholder={userInfo.mail} value={eMail} onChange={e => setEMail(e.target.value)}/>
				</div>
				<div className='row mt-3'>
					<label className=''>Address:</label>
					<input className='border form-control' placeholder={userInfo.address} value={adress} onChange={e => setAdress(e.target.value)}/>
				</div>
				<div className='row mt-3'>
					<button className='btn btn-block btn-outline-dark'>Change Password</button>
				</div>
				<div className='row mt-3 justify-content-between'>
					<button className='btn btn-success' disabled={userName == '' && wholeName == '' && eMail == '' && adress == ''}>Save</button>
					<button className='btn btn-danger' onClick={() => setLogout(true)}>Logout</button>
				</div>
			</div>
		</div>

	);
}

export default Profile;