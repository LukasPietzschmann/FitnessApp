/**
 * @author Lukas Pietzschmann
 */

import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import Modal from '../Modal/Modal';
import '../Cards/ButtonBehavior.css';

function PlanCard({ className, name, units, id }) {
	const [token, uid] = useUser();
	const [groups, setGroups] = useState([]);
	const [addToGroup, setAddToGroup] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		axiosInstance.get(`/user/${uid}/groups`, { headers: { Token: token } })
			.then(({ data }) => setGroups(data))
			.catch(err => console.error(err));
	}, [token, uid]);

	return (
		<div className={`card ${className}`}>
			<Modal showModal={addToGroup} showModalHook={setAddToGroup}>
				<h1>{name}</h1>
				<div>Select the Group to add this Plan to:</div>
				<div className='list-group mt-3'>
					{groups.map(({gname, _id}) => { return(
						<button key={_id + gname} className='list-group-item list-group-item-action' onClick={() => {
							axiosInstance.post(`/group/${_id}/plan`, { "pid": id }, { headers: { Token: token, uid: uid } })
								.then(_ => window.location.href = `/groups/${_id}`)
								.catch(err => {
									if (err.response && err.response.status === 428)
										setError('This Plan could not be added this Group, as you\'re already working on a Plan!');
									else
										console.error(err);
								});
						}}>{gname}</button>
					)})}
				</div>
			</Modal>
			<Modal showModal={error !== ''} showModalHook={e => {
				if (!e)
					setError('');
			}}>
				<h2 className='text-danger text-center'>
					{error}
				</h2>
			</Modal>
			<div className='card-body'>
				<div className='row'>
					<h1 className='col'>{name}</h1>
				</div>
				<div className='row justify-content-start'>
					{units.map(({ name, rep }, i) =>
						<div className='col-auto' key={i}>{name} ({rep} Wiederholung{rep > 1 ? 'en' : ''})</div>)}
				</div>
			</div>
			<div className='btn-group'>
				<div className='card-footer btn' onClick={() => {
					axiosInstance.post(`/user/${uid}/plan`, { "pid": id }, { headers: { Token: token } })
						.then(_ => window.location.href = '/')
						.catch(err => {
							if (err.response && err.response.status === 428)
								setError('This Plan could not be added to your Profile, as you\'re already working on a Plan!');
							else
								console.error(err);
						});
				}}>Add to Profile</div>
				<div className='card-footer btn' onClick={() => setAddToGroup(true)}>Add to Group</div>
			</div>
		</div>
	);
}

export default PlanCard;