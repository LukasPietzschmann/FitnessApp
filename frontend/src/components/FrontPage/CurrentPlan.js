import { useState } from "react";
import { useEffect } from "react";
import { axiosInstance } from "../../constants";
import useUser from "../../hooks/useUser";
import ProgressCircle from "../ProgressCircle/ProgressCircle";

function CurrentPlan({ className }) {
	const [token, uid, logout] = useUser();
	const [currPlan, setCurrPlan] = useState();
	const [finishedPerc, setFinished] = useState(0);

	useEffect(() => {
		axiosInstance.get(`/user/${uid}`, { headers: { Token: token } })
			.then(({ data }) => {
				if (!data.plans || data.plans.length < 1)
					return;
				axiosInstance.get(`/workoutPlan/${data.plans[0]}`, { headers: { Token: token, uid: uid } })
					.then(({ data }) => setCurrPlan(data))
					.catch(err => console.error(err.response));
			})
			.catch(err => console.error(err.response));
	}, []);

	useEffect(() => {
		if (!currPlan)
			return;
		let total = currPlan.units.length;
		let fin = 0;
		currPlan.units.forEach(({ finished }) => {
			if (finished)
				fin += 1;
		});
		setFinished(fin * 100 / total);
	}, [currPlan]);

	return (
		<div className={`card ${className}`}>
			{currPlan ?
				<div className='row' onClick={() => window.location.href = `/plan/${currPlan._id}`} style={{cursor: 'pointer'}}>
					<ProgressCircle className='col-2 align-self-center' percentage={finishedPerc} />
					<div className='col'>
						<div className='row'>
							<h1 className='col'>{currPlan.name}</h1>
						</div>
						<div className='row justify-content-start'>
							{currPlan.units.map(({ name, rep, finished }, i) =>
								<div className={`col ${finished ? 'text-success' : ''}`} key={i} >{name} ({rep} Wiederholung{rep > 1 ? 'en' : ''})</div>)}
						</div>
					</div>
				</div>
				:
				<h2 className='text-center'>Looks like you're lazy. There are no Plans!</h2>}
		</div>
	);
}

export default CurrentPlan;