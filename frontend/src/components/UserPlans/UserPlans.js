/**
 * @author Lukas Pietzschmann
 */

import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import Plan from './Plan';

/**
 * This Component shows all Workout-Plans the User currently works on. If there are no Workout-Plans a message is shown, where the User is prompted to add a Workout-Plan.
 * @param className The className always gets forwarded to the Top-Level Element of the Component. This enables Styling 'from outside'.
 */
function UserPlans({ className }) {
	const [token, uid] = useUser();
	const [planPack, setPlanPack] = useState([]);

	useEffect(() => {
		axiosInstance.get(`user/${uid}/plan`, { headers: { Token: token } })
			.then(({ data }) => setPlanPack(data))
			.catch(err => console.error(err));
	}, [token, uid]);

	return (
		<div className={className}>
			{planPack.length > 0 ?
				<div className='d-flex flex-wrap justify-content-center'>
					{planPack.map(({ _id, name, units }) => <Plan className='m-3' key={_id} id={_id} name={name} units={units} style= {{"width": "clamp(300px, 50%, 650px)", "height": "min-content"}}/>)}
				</div>
				:
				<div className='text-center mt-5'>
					<h2>Nothing here!</h2>
					<a className='h4' href='/area'>Go ahead and add a Plan!</a>
				</div>
			}
		</div>
	);
}

export default UserPlans;