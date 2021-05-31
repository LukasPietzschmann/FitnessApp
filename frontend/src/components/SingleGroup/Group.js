import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import Card from '../Cards/Card';
import useWebSocket from 'react-use-websocket';
import PlanCard from './PlanCard';


function Group({ className, match }) {
	const [token, uid, logout] = useUser();
	const {lastMessage, sendJsonMessage} = useWebSocket('ws://localhost:4000');
	const [group, setGroup] = useState(null);
	const [memberNames, setMemberNames] = useState([]);
	const [members, setMembers] = useState([]);
	const [plans, setPlans] = useState([]);

	useEffect(() => {
		sendJsonMessage({'uid': uid, 'token': token});
	}, [uid, token]);

	useEffect(() => {
		axiosInstance.get(`/group/${match.params.group_id}`, { headers: { Token: token, uid: uid } })
			.then(({ data }) => {
				setGroup(data);
				setMembers(data.members)
			})
			.catch(err => console.error(err));
	}, []);

	useEffect(() => {
		axiosInstance.get(`/group/${match.params.group_id}/plans`, { headers: { Token: token, uid: uid } })
			.then(({ data }) => setPlans(data))
			.catch(err => console.error(err));
	}, []);

	useEffect(() => {
		let pArr = [];
		members.map(member => pArr.push(axiosInstance.get(`/user/${member}/name`)));
		Promise.allSettled(pArr).then(results => setMemberNames(results.map(({ value }) => value.data)));
	}, [members]);

	useEffect(() => {
		if (!lastMessage)
			return
		const data = JSON.parse(lastMessage.data)
		if (!data.target.startsWith('group.members.') || data.body.group != match.params.group_id)
			return
		if (data.target.startsWith('group.members.add')) {
			if (!members.includes(data.body.member))
				setMembers([...members, data.body.member])
		} else if (data.target.startsWith('group.members.remove')) {
			setMembers(members.filter(elem => elem != data.body.member))
		}
	}, [lastMessage]);

	return (
		group && <div className='m-3'>
			<h1 className='display-3 text-center' onChange={e => console.log(e.target.value)}>{group.gname}</h1>
			<div className='row align-items-start'>
				<div className='col-9 d-flex flex-wrap justify-content-around'>
					{plans.map(({ name, units, _id }, i) => {return (
						<PlanCard key={_id} name={name} units={units} id={_id} />
					)})}
				</div>
				<div className='col'>
					<img className='img-fluid rounded row-auto mb-4' alt={`${group.gname} Picture`} src={group.img} />
					<div className='row-auto mb-4'>
						<ul className='list-group'>
							{memberNames.map(member => <li className='list-group-item' key={member}>{member}</li>)}
						</ul>
					</div>
					<div className='btn-group-vertical d-flex'>
						<button className='btn btn-block btn-primary' onClick={() => {
							let link = `${process.env.REACT_APP_FRONTEND_BASE}groups/${group._id}/join`;
							navigator.clipboard.writeText(link)
								.then(() => console.log('Async: Copying to clipboard was successful!'))
								.catch((err) => console.error('Async: Could not copy text: ', err));
						}}>Copy Invitation Link</button>
						<button className='btn btn-block btn-outline-danger' onClick={() => {
							axiosInstance.delete(`/group/${group._id}/${uid}`, { headers: { Token: token } })
								.then(res => window.location.href = "/")
								.catch(err => console.error(err.response));
						}}>Leave Group</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Group;