/**
 * @author Lukas Pietzschmann, Vincent Ugrai
 */

import { useEffect, useState } from 'react';

import useUser from '../../hooks/useUser';
import { axiosInstance } from '../../constants';

import Card from '../Cards/Card';

function AreaChoice({ className }) {
	const [token, uid] = useUser();
	const [categories, setCats] = useState([]);

	useEffect(() => {
		axiosInstance.get('/category', { headers: { Token: token, uid: uid } })
			.then(({ data }) => setCats(data))
			.catch(err => console.log(err));
	}, [token, uid]);

	return (
		<div className={`${className}`}>
			<h1 className='display-3 text-center'>Categories</h1>
			<div className='d-flex justify-content-around align-items-center flex-wrap' style={{ height: '85vh' }}>
				{categories.map(({ _id, name, img }) => {return (
					<Card className='shadow-lg m-3' key={_id} onClick={() => window.location.href = `/area/${_id}`} img={img}>
						<h5 className='text-center'>{name}</h5>
					</Card>
				)})}
			</div>
		</div>
	);
}

export default AreaChoice;