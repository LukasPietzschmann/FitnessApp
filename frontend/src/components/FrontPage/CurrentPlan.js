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
		axiosInstance.get(`/user/${uid}/plan`, { headers: { Token: token } })
			.then(({ data }) => setCurrPlan(data))
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
		<div className={`${className}`}>
			{currPlan ?
				<div className='d-flex justify-content-center' onClick={() => window.location.href = '/plan'} style={{cursor: 'pointer'}}>
					<ProgressCircle percentage={finishedPerc} text={currPlan.name} />
				</div>
				:
				<div className='text-center'>
					<h2>Looks like you're lazy. There is currently no Plan!</h2>
					<a className='h4' href='/area'>Go ahed and add one!</a>
				</div>
					}
		</div>
	);
}

export default CurrentPlan;