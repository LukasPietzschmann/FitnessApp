/**
 * @author Lukas Pietzschmann
 */

import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import UnitCard from './UnitCard';

function GroupPlan({ className, group_id, plan_id, name, units, members }) {
	const { lastMessage, sendJsonMessage } = useWebSocket('ws://localhost:4000');
	const [token, uid] = useUser();
	const [finishedPerUnit, setFinishedPerUnit] = useState([]);

	useEffect(() => {
		sendJsonMessage({ 'uid': uid, 'token': token });
	}, [uid, token]);

	useEffect(() => {
		setFinishedPerUnit(units.map(({ finished }) => finished.filter(({ finished }) => finished).map(({ uid }) => uid)));
	}, [units]);

	useEffect(() => {
		if (!lastMessage)
			return
		const data = JSON.parse(lastMessage.data)
		if (data.target.startsWith('group.plan.')) {
			if (data.body.group !== group_id)
				return;
			if (data.target.startsWith('group.plan.finished')) {
				if (data.body.plan !== plan_id)
					return;
				if (data.target.startsWith('group.plan.finished.add')) {
					const tempF = finishedPerUnit;
					const i = units.findIndex(({ _id }) => _id === data.body.unit);
					if (finishedPerUnit[i].includes(data.body.member))
						return
					tempF[i].push(data.body.member);
					setFinishedPerUnit([...tempF]);
				} else if (data.target.startsWith('group.plan.finished.remove')) {
					const tempF = finishedPerUnit;
					const i = units.findIndex(({ _id }) => _id === data.body.unit);
					const j = tempF.indexOf(data.body.member);
					tempF[i].splice(j, 1);
					setFinishedPerUnit([...tempF]);
				}
			}
		} else if (data.target.startsWith('group.members.remove')) {
			setFinishedPerUnit(finishedPerUnit.map(unit => unit.filter(member => member !== data.body.member)))
		}
	}, [lastMessage]);

	return (
		<div className={`card ${className}`}>
			<div className='card-body'>
				<h5 className='card-title'>{name}</h5>
				<hr />
				<div>
					{units.map(({ _id, name, rep }, i) => {return (
						<UnitCard className='m-3' key={_id} name={name} rep={rep} finished={finishedPerUnit} i={i} unit_id={_id} group_id={group_id} plan_id={plan_id} />
					)})}
				</div>
				{finishedPerUnit.every(finsihed => members.every(member => finsihed.includes(member))) ?
					<button className='btn btn-success btn-block' onClick={() => {
						axiosInstance.delete(`/group/${group_id}/plan/${plan_id}`, { headers: { Token: token, uid: uid } })
							.catch(err => console.error(err));
					}}>Finish Plan</button> : ''}
			</div>
		</div>
	);
}

export default GroupPlan;