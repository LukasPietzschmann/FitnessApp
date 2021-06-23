/**
 * @author Lukas Pietzschmann
 */

import { useEffect, useState } from 'react';
import UnitCard from './UnitCard';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';

function Plan({ className, style, id, name, units }) {
	const [token, uid] = useUser();
	const [finishedPerUnit, setFinishedPerUnit] = useState([]);

	useEffect(() => {
		setFinishedPerUnit(units.map(({ finished }) => finished));
	}, [units]);

	return (
		<div className={`card ${className}`} style={style}>
			<div className='card-body'>
				<h5 className='card-title'>{name}</h5>
				<hr />
				{units.map(({ _id, name, rep }, i) => <UnitCard key={i} className='m-3' unit_id={_id} plan_id={id} name={name} rep={rep} finished={finishedPerUnit[i]} updateFinished={finished => {
					finishedPerUnit[i] = finished;
					setFinishedPerUnit([...finishedPerUnit]);
				}} />)}
				{finishedPerUnit.every(e => e) ? <button className='btn btn-block btn-success' onClick={() => {
					axiosInstance.delete(`/user/${uid}/plan/${id}`, { headers: { Token: token } })
						.then(_ => window.location.href = '/')
						.catch(err => console.error(err.response));
				}}>Finish Plan</button> : ''}
			</div>
		</div>
	);
}

export default Plan;