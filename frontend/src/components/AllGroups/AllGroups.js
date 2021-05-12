import { useEffect, useState } from 'react';

import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import Modal from '../Modal/Modal';
import GroupCard from './GroupCard.js';

import JoinGroupIcon from '../../image/join_group.svg';
import AddGroupIcon from '../../image/add.svg';


function AllGroups({ className }) {
	const [token, uid, logout] = useUser();
	const [groups, setGroups] = useState([]);
	const [j, join] = useState(false);
	const [a, add] = useState(false);
	const [joinLink, setJoinLink] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		axiosInstance.get(`/user/${uid}/groups`, { headers: { Token: token } })
			.then(({data}) => setGroups(data))
			.catch(err => err.response && console.error(err.response));
	}, [uid, token]);

	return (
		<div className={`${className}`}>
			<Modal showModal={j} showModalHook={r => { join(r); setError(''); setJoinLink('')}}>
				<div className='text-center text-danger mb-2'>{error}</div>
				<form>
					<label>Invitation Link</label>
					<input className='form-control' type='url' placeholder='Put your Invitation Link here...' value={joinLink} onChange={e => setJoinLink(e.target.value)} />
				</form>
				<button className='btn btn-success mt-3' onClick={() => {
					if (joinLink === '') {
						setError('No Link was given');
						return;
					}
					const match = /(?:http[s]?:\/\/)?[a-zA-Z0-9.]*(?::[0-9]*)?\/groups\/([0-9]{10})\/join/i.exec(joinLink);
					if (!match){
						setError('Invalid Invitation Link');
						return;
					}
					const gid = match[1];
					axiosInstance.post(`/group/${gid}/${uid}`, null, { headers: { Token: token } })
						.then(res => window.location.href = `/groups/${gid}`)
						.catch(err => setError(err.response));

				}}>Join Group</button>
				<button className='btn btn-outline-danger mt-3 float-right' onClick={() => { join(false); setError(''); setJoinLink('')}} >Cancel</button>
			</Modal>
			<Modal showModal={a} showModalHook={add}>
				Add
			</Modal>
			<div className='d-inline-flex mt-3 ml-3'>
				{groups.map(({ gname, img, _id }, i) => <GroupCard className='shadow-lg m-2' key={i} title={gname} target={`/groups/${_id}`} img={img} />)}
				<GroupCard className='shadow-lg m-2' key='join' title='Join Group' img={JoinGroupIcon} onClick={() => join(true)} />
				<GroupCard className='shadow-lg m-2' key='add' title='Add Group' img={AddGroupIcon} onClick={() => add(true)} />
			</div>
		</div>
	);
}

export default AllGroups;