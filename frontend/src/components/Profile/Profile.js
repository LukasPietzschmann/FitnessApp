import { useEffect, useState } from 'react';

import { axiosInstance, hash } from '../../constants';
import useUser from '../../hooks/useUser';
import profilPic from '../../image/sample-profile.png';
import Login from './Login';
import Modal from '../Modal/Modal';

function ChangePassword({ password, uid, token, setChangePassword, setUserInfo }) {
	const [newPassword, setNewPassword] = useState('');
	const [oldPassword, setOldPassword] = useState('');
	const [newPasswordConfirmed, setNewPasswordConfirmed] = useState('');
	const [error, setError] = useState('');

	return (
		<div>
			<div className='text-center text-danger mb-2'>{error}</div>
			<div className='row'>
				<div className='col'>
					<label>Old Password:</label>
				</div>
				<div className='col-auto'>
					<input className='border form-control' type='password' placeholder='Input old Password...' value={oldPassword} onChange={e => setOldPassword(e.target.value)}/>
				</div>
			</div>
			<div className='row mt-3'>
				<div className='col'>
					<label>New Password:</label>
				</div>
				<div className='col-auto'>
					<input className='border form-control' type='password' placeholder='Input new Password...' value={newPassword} onChange={e => setNewPassword(e.target.value)}/>
				</div>
			</div>
			<div className='row mt-3'>
				<div className='col'>
					<label>Confirm new Password:</label>
				</div>
				<div className='col-auto'>
					<input className='border form-control' type='password' placeholder='Confirm new Password...' value={newPasswordConfirmed} onChange={e => setNewPasswordConfirmed(e.target.value)}/>
				</div>
			</div>
			<div className='row justify-content-between mt-3'>
				<button className='btn btn-success ml-3' disabled={newPassword == '' && oldPassword == ''} onClick={() => {
					if (hash(oldPassword) !== password) {
						setError('Old Password is wrong!');
						return;
					}
					if (newPassword !== newPasswordConfirmed) {
						setError('New Password and Confirmed Password are not the Same!');
						return;
					}
					if (newPassword === oldPassword) {
						setError('New Password and old Password are not allowed to be the Same!');
						return;
					}
					axiosInstance.put(`/user/${uid}`, { 'password': hash(newPassword) }, { headers: { Token: token, uid: uid } })
						.then(({ data }) => {
							setChangePassword(false);
							setUserInfo(data);
						})
						.catch(err => console.error(err));
				}}>Save Password</button>
				<button className='btn btn-danger mr-3' onClick={() => setChangePassword(false)}>Cancel</button>
			</div>
		</div>
	);
}

function Profile({ className }) {
	const [token, uid, logout] = useUser();
	const [userInfo, setUserInfo] = useState({});
	const [logoutModal, setLogout] = useState(false);
	const [userName, setUserName] = useState('');
	const [wholeName, setWholeName] = useState('');
	const [eMail, setEMail] = useState('');
	const [adress, setAdress] = useState('');
	const [changePassword, setChangePassword] = useState(false);

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

			<Modal Modal closeOnClickOutside={false} showModal={changePassword} showModalHook={setChangePassword}>
				<ChangePassword uid={uid} token={token} password={userInfo.password} setChangePassword={setChangePassword} setUserInfo={setUserInfo}/>
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
					<button className='btn btn-block btn-outline-dark' onClick={() => setChangePassword(true)}>Change Password</button>
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