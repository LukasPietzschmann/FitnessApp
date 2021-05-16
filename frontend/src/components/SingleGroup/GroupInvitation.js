import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';

//Ich versuch mich mal daran, das aufzuhübschen. (Johannes S)
function GroupInvitation({ className, match }) {
	const [token, uid, logout] = useUser();
	const [groupName, setName] = useState('');
	//const [groupPicture, setName] = useState('');

	useEffect(() => {
		axiosInstance.get(`/group/${match.params.group_id}/name`)
			.then(({ data }) => setName(data))
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
		<div className={className}>
			<button className='btn btn-success' onClick={() => {
				axiosInstance.post(`/group/${match.params.group_id}/${uid}`, null, { headers: { Token: token } })
					.then(res => window.location.href = `/groups/${match.params.group_id}`)
					.catch(err => console.error(err.response));
			}}> Join Group <b>{groupName}</b></button >
			</div>
	)
}

export default GroupInvitation;