import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';

//Ich versuch mich mal daran, das aufzuhübschen. (Johannes S)
function GroupInvitation({ className, match }) {
	const [token, uid, logout] = useUser();
	const [groupName, setName] = useState('');
	const [groupPicture, setImg] = useState('');

	useEffect(() => {
		axiosInstance.get(`/group/${match.params.group_id}/name`)
			.then(({ data }) => setName(data))
			.catch(err => console.error(err));

		axiosInstance.get(`/group/${match.params.group_id}/img`)
			.then(({ data }) => setImg(data))
			.catch(err => console.error(err));
	}, []);

	if (!token)
		return (
			<div className={className}>
				<div>Log in to join group</div>
				<button className='btn btn-success' onClick={() => window.location.href = '/login'}>Login</button>
			</ div>
		);
	return (
		<div className='d-flex justify-content-center align-items-center' style={{ height: '70vh' }}>
			<div class="text-center">
			</div>
			<div className={`card hover-card ${className}`} onClick={() => {
				axiosInstance.post(`/group/${match.params.group_id}/${uid}`, null, { headers: { Token: token } })
					.then(res => window.location.href = `/groups/${match.params.group_id}`)

					.catch(err => console.error(err.response));
			}}

				style={{ height: '38vh', width: '40vh' }}>
				<img className='card-img-top' src={groupPicture} alt={groupName} style={{ height: '30vh', objectFit: 'cover' }} />
				<div className='card-body' style={{ backgroundColor: '#28a745' }}>
					<h5 className={` text-lSight text-center ${groupName}`}> Join Group <b>{groupName}</b></h5>
				</div>
			</div>
		</div>
	)
}

export default GroupInvitation;