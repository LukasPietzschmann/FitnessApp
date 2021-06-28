/**
 * @author Lukas Pietzschmann
 */

import { useState } from "react";
import { useEffect } from "react";
import { axiosInstance } from "../../constants";
import useUser from "../../hooks/useUser";
import ProgressCircle from "../ProgressCircle/ProgressCircle";

/**
 * This Component represents a single Plan. It shows the Plans name and the Users Progress.
 * @param plan The displayed Plan.
 */
function CurrentPlan({ plan }) {
	const [finishedPerc, setFinished] = useState(0);

	useEffect(() => {
		let total = plan.units.length;
		let fin = 0;
		plan.units.forEach(({ finished }) => {
			if (finished)
				fin += 1;
		});
		setFinished(fin * 100 / total);
	}, [plan]);

	return (
		<div onClick={() => window.location.href = '/plan'} style={{ cursor: 'pointer'}}>
			<ProgressCircle percentage={finishedPerc} text={plan.name} />
		</div>
	);
}

/**
 * This Component shows all Workout-Plans the Users is currently working on. It displays the Name of the Workout-Plan and the Users Progress.
 * @param className The className always gets forwarded to the Top-Level Element of the Component. This enables Styling 'from outside'.
 */
function CurrentPlans({ className }) {
	const [token, uid] = useUser();
	const [planPack, setPlanPack] = useState([]);

	useEffect(() => {
		axiosInstance.get(`/user/${uid}/plan`, { headers: { Token: token } })
			.then(({ data }) => setPlanPack(data))
			.catch(err => console.error(err.response));
	}, [token, uid]);

	return (
		<div className={`d-flex flex-wrap justify-content-center ${className}`}>
			{planPack.length > 0 ?
				planPack.map(plan => <CurrentPlan plan={plan}/>)
				:
				<div className='text-center'>
					<h2>Looks like you're lazy. There is currently no Plan!</h2>
					<a className='h4' href='/area'>Go ahead and add one!</a>
				</div>
			}
		</div>
	);
}

export default CurrentPlans;