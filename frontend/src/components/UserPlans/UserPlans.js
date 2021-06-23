import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import Plan from './Plan';

function UserPlans({ className }) {
	const [token, uid] = useUser();
	const [planPack, setPlanPack] = useState([]);

	useEffect(() => {
		axiosInstance.get(`user/${uid}/plan`, { headers: { Token: token } })
			.then(({ data }) => setPlanPack(data))
			.catch(err => console.error(err));
	}, [token, uid]);

	console.log(planPack);

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