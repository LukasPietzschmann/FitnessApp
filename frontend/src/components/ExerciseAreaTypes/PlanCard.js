/**
 * @author Lukas Pietzschmann
 */

import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import Modal from '../Modal/Modal';
import '../Cards/ButtonBehavior.css';

/**
 * This Component shows one Wokout-Plan in the ExerciseAreaTypes Component. This Component also provides a way to add the Workout-Plan to the Users Profile or to a Group the User is a Member of.
 * @param className The className always gets forwarded to the Top-Level Element of the Component. This enables Styling 'from outside'.
 * @param name The Name of the Workout-Plan
 * @param units A List of Units of a Workout-Plan.
 * @param id The ID of the Workout-Plan.
 */
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
								.catch(err => console.error(err));
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
						<div className='col-auto' key={i}>{name} ({rep} Iteration{rep > 1 ? 's' : ''})</div>)}
				</div>
			</div>
			<div className='btn-group'>
				<div className='card-footer btn' onClick={() => {
					axiosInstance.post(`/user/${uid}/plan`, { "pid": id }, { headers: { Token: token } })
						.then(_ => window.location.href = '/')
						.catch(err => console.error(err));
				}}>Add to Profile</div>
				<div className='card-footer btn' onClick={() => setAddToGroup(true)}>Add to Group</div>
			</div>
		</div>
	);
}

export default PlanCard;