/**
 * @author Lukas Pietzschmann, Vincent Ugrai
 */

import { useState, useEffect } from 'react';

import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import PlanCard from './PlanCard';

/**
 * This Component shows all Workout-Plans in one Category. It is shown under /area/<id>
 * @param className The className always gets forwarded to the Top-Level Element of the Component. This enables Styling 'from outside'.
 * @param match In the match Parameter the React-Router stores Information about the current Route. If the Route contains a variable Path, the variable is accessable here.
 */
function ExerciseAreaTypes({ className, match }) {
	const [token, uid] = useUser();
	const [plans, setPlans] = useState([]);

	useEffect(() => {
		axiosInstance.get(`/category/${match.params.area_id}`, { headers: { Token: token, uid: uid } })
			.then(({ data }) => setPlans(data))
			.catch(err => console.error(err));
	}, [match.params.area_id, token, uid]);

	return (
		<div className={className}>
			<div className='d-flex flex-column flex-wrap justify-content-around align-items-center' style={{ height: '80vh' }}>
				{plans.map(({ name, units, _id }) => {return (
					<PlanCard className='shadow-lg' name={name} units={units} id={_id} />
				)})}
			</div>
		</div>
	);
}

export default ExerciseAreaTypes;