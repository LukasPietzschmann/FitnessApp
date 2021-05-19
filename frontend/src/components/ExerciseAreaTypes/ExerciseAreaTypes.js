import { useState, useEffect } from 'react';

import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import Card from '../Cards/Card';

function ExerciseAreaTypes({ className, match }) {
	const [token, uid, logout] = useUser();
	const [plans, setPlans] = useState([]);

	useEffect(() => {
		axiosInstance.get(`/category/${match.params.area_id}`, { headers: { Token: token, uid: uid } })
			.then(({ data }) => setPlans(data))
			.catch(err => console.error(err));
	}, []);

	return (
		<div>
			<div className='d-flex flex-column justify-content-around align-items-center' style={{ height: '80vh' }}>
				{plans.map(({ name, units }, i) => {
					return (
					<Card className='shadow-lg bg-light' key={i}>
						<h5>{`${name} with ${units.length} Units`}</h5>
					</Card>
				)})}
			</div>
		</div>
	);
}

export default ExerciseAreaTypes;