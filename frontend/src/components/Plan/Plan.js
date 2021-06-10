import { useEffect, useState } from 'react';
import UnitCard from './UnitCard';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';

function Plan({ className }) {
	const [token, uid] = useUser();
	const [plan, setPlan] = useState();
	const [finishedPerUnit, setFinishedPerUnit] = useState([]);

	useEffect(() => {
		axiosInstance.get(`/user/${uid}/plan`, { headers: { Token: token, uid: uid } })
			.then(({ data }) => setPlan(data))
			.catch(err => console.error(err));
	}, [token, uid]);

	useEffect(() => {
		if (!plan)
			return;
		setFinishedPerUnit(plan.units.map(({ finished }) => finished));
	}, [plan]);

	return (
		<div className={className}>
			{plan ?
				<>
					<h1 className='display-3 text-center'>{plan.name}</h1>
					<div className='mx-5'>
						{plan.units.map(({ _id, name, rep }, i) => <UnitCard key={i} className='m-3' unit_id={_id} name={name} rep={rep} finished={finishedPerUnit[i]} updateFinished={finished => {
							finishedPerUnit[i] = finished;
							setFinishedPerUnit([...finishedPerUnit]);
						}} />)}
						{finishedPerUnit.every(e => e) ? <button className='btn btn-block btn-success' onClick={() => {
							axiosInstance.delete(`/user/${uid}/plan`, { headers: { Token: token } })
								.then(_ => window.location.href = '/')
								.catch(err => console.error(err));
						}}>Finish Plan</button> : ''}
					</div>
				</>
				: ''}
		</div>
	);
}

export default Plan;