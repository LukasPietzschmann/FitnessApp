/**
 * @author Lukas Pietzschmann, Vincent Ugrai
 */

import { useEffect, useState } from 'react';

import { axiosInstance, hash } from '../../constants';
import useUser from '../../hooks/useUser';
import profilPic from '../../image/sample-profile.png';
import Modal from '../Modal/Modal';
import editPen from '../../image/editPen.png';
import getBase64ImageData from '../../tools/getBase64ImageData';
import './changeImgHover.css';

/**
 * This Component lets the User join a Group by inputing a Link. It is shown inside a Modal.
 * @param showJoinGroup a function to show or unshow the Outside Modal.
 * @param joinLink the state in which the Link inputted by the User is stored.
 * @param setJoinLink a function to set the joinLink.
 */

/**
 * This Component lets the User change his Password. It is shown inside a Modal.
 * @param password The existing Password. This is used to check if the new Passwort does not equal the old one.
 * @param showChangePassword a function to show or unshow the Outside Modal.
 * @param setUserInfo After the Passwort was updated, this function gets called with the updated Userdata.
 */
function ChangePassword({ password, showChangePassword, setUserInfo }) {
	const [token, uid] = useUser();
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
				<button className='btn btn-success ml-3' disabled={newPassword === '' && oldPassword === ''} onClick={() => {
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
							showChangePassword(false);
							setUserInfo(data);
						})
						.catch(err => console.error(err));
				}}>Save Password</button>
				<button className='btn btn-danger mr-3' onClick={() => showChangePassword(false)}>Cancel</button>
			</div>
		</div>
	);
}

/**
 * This Component lets the User view and Change his Information. He can also Logout or delete his Account here. This Component is shown under /profile
 * @param className The className always gets forwarded to the Top-Level Element of the Component. This enables Styling 'from outside'.
 */
function Profile({ className }) {
	const [token, uid, logout] = useUser();
	const [userInfo, setUserInfo] = useState({});
	const [logoutModal, setLogout] = useState(false);
	const [userName, setUserName] = useState('');
	const [wholeName, setWholeName] = useState('');
	const [eMail, setEMail] = useState('');
	const [address, setaddress] = useState('');
	const [changePassword, showChangePassword] = useState(false);
	const [groups, setGroups] = useState([]);
	const [deleteProfil, showDeleteProfile] = useState(false);
	const [error, setError] = useState('');
	const [image, setImage] = useState(null);

	useEffect(() => {
		axiosInstance.get(`/user/${uid}/groups`, { headers: { Token: token } })
			.then(({ data }) => setGroups(data))
			.catch(err => console.error(err));
	}, [uid, token]);

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
	<div className={`container-fluid ${className}`} >
		<div className=''>
			<div className='row ml-2'>
				<Modal closeOnClickOutside={false} showModal={logoutModal} showModalHook={setLogout}>
					<h2 className='mb-3 text-center'>Are you sure?</h2>
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

				<Modal Modal closeOnClickOutside={false} showModal={changePassword} showModalHook={showChangePassword}>
					<ChangePassword password={userInfo.password} showChangePassword={showChangePassword} setUserInfo={setUserInfo}/>
				</Modal>

				<Modal Modal closeOnClickOutside={false} showModal={deleteProfil} showModalHook={showDeleteProfile}>
					<h2 className='mb-3 text-center'>Are you Sure?</h2>
						<button className='btn btn-danger' onClick={() => {
							axiosInstance.delete(`/user/${uid}`, { headers: { Token: token } })
								.then(_ => {
									logout();
									window.location.href = '/register';
								})
								.catch(err => console.error(err));

						}}>Yes, delete my Account</button>
						<button className='btn btn-success float-right' onClick={() => showDeleteProfile(false)}>No</button>
				</Modal>

				<div className='col-sm-auto m-4'>
					<div className='row justify-content-center justify-content-sm-left hoverEditContainer'>
							<img className='rounded-circle hoverEditImg' src={image ? image.url : (userData && userData.img ? userData.img : profilPic)} height='100rem' width='100rem' alt='Profile Pic.' style={{ objectFit: 'cover' }} />
							<img className='rounded-circle hoverEditPen' height='60rem' width='60rem' src={editPen} alt='edit Pen' onClick={() => document.getElementById('select-file').click() }/>
					</div>
				</div>
				<div className='col-sm-5 m-4'>
					<div className='row mt-3'>
						<label className=''>Username:</label>
						<div className='input-group'>
							<div className='input-group-prepend'>
								<span className='input-group-text'>@</span>
							</div>
							<input className='border bg-light form-control' disabled placeholder={userInfo.uname} value={userName} onChange={e => setUserName(e.target.value)}/>
						</div>
					</div>
					<div className='row mt-3'>
						<label className=''>Name:</label>
						<input className='border form-control' placeholder={userInfo.name} value={wholeName} onChange={e => setWholeName(e.target.value)}/	>
					</div>
					<div className='row mt-3'>
						<label className=''>E-Mail:</label>
						<input className='border form-control' placeholder={userInfo.mail} value={eMail} onChange={e => setEMail(e.target.value)}/>
					</div>
					<div className='row mt-3'>
						<label className=''>Address:</label>
						<input className='border form-control' placeholder={userInfo.address} value={address} onChange={e => setaddress(e.target.value)}/>
					</div>
					<div className='row mt-3'>
						<button className='btn btn-block btn-outline-dark' onClick={() => showChangePassword(true)}>Change Password</button>
					</div>
					<div className='row mt-3'>
						<div className='text-center text-danger mb-2'>{error}</div>
						<input className='d-none' id='select-file' type='file' accept='image/jpg, image/jpeg' onInput={e => {
							let file = e.target.files[0];
							var size = file.size;
							if (size > 1e6) {
								setError('Image File cannot be larger than 1mb');
								return ;
							}
								getBase64ImageData(URL.createObjectURL(file)).then(data =>
									setImage({ file: file, url: URL.createObjectURL(file), name: file.name, rawBytes: data }));
						}} />
					</div>
					<div className='row mt-3 justify-content-between'>
						<button className='btn btn-success' disabled={userName === '' && wholeName === '' && eMail === '' && address === '' && !image} onClick={() => {
							const dict = { 'uname': userName, 'name': wholeName, 'address': address, 'mail': eMail };
							if (image)
								dict.rawImg = image.rawBytes;
							const filtered = Object.fromEntries(Object.entries(dict).filter(([k, v]) => v !== ''));
							console.log(filtered);
							axiosInstance.put(`/user/${uid}`, filtered, { headers: { Token: token, uid: uid } })
								.then(({ data }) => {
									setUserInfo(data);
								})
								.catch(err => console.error(err));
						}}>Save</button>
						<div>
							<button className='btn btn-outline-danger mr-2' onClick={() => setLogout(true)}>Logout</button>
							<button className='btn btn-danger align-self-end' onClick={() => showDeleteProfile(true)}>Delete Profile</button>
						</div>
					</div>
				</div>
				{groups.length > 0 ? <div className='col-sm ml-sm-5 mt-4'>
					<div>
						<h3>Groups:</h3>
					</div>
					<div className='list-group mt-3'>
							{groups.map(({gname, _id}) => { return(
								<a key={_id + gname} className='list-group-item list-group-item-action' href={`/groups/${_id}`}>{gname}</a>
							)})}
					</div>
				</div> : ''}
			</div>
			</div>
			<footer className='w-100 text-center' style={{position: 'fixed', bottom: 0, left: 0}}>
				This Site was built using <a href='/Licenses'>Open Source Software</a>
			</footer>
	</div>
	);
}

export default Profile;