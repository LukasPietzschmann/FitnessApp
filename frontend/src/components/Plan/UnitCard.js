import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import Accordion from '../Accordion/Accordion';

function UnitCard({ className, unit_id, plan_id, name, rep, finished }) {
	const [token, uid, logout] = useUser();
	const [data, setData] = useState(null);
	const [isFinished, setFinished] = useState(finished);

	useEffect(() => {
		axiosInstance.get(`/wikiHow/${name}`)
			.then(({ data }) => setData(data))
			.catch(err => console.error(err));
	}, []);

	return (
		<div className={`card ${className}`}>
			{data ? <Accordion className={`${isFinished ? 'border border-success' : ''} bg-light`} title={`${name} (${rep} Iteration${rep > 1 ? 's' : ''}) ${isFinished ? '✓' : ''}`} >
				<ul className='list-group'>
					{data.map(({ summary, description }, i) => { return (
						<div key={i} className='card my-2'>
							<div className='card-body'>
								<h5 className='card-title'>{summary}</h5>
								<div className='card-text'>{description}</div>
							</div>
						</div>
					)})}
				</ul>
				{!isFinished ? <button className='btn btn-success btn-block' onClick={() => {
					axiosInstance.put(`/user/${uid}/plan`, { "unit_id": unit_id, "finished": true }, { headers: { Token: token } })
						.then(res => setFinished(true))
						.catch(err => console.error(err.response));
				}}>Mark as done</button> :
					<button className='btn btn-dark btn-block' onClick={() => {
						axiosInstance.put(`/user/${uid}/plan`, { "unit_id": unit_id, "finished": false }, { headers: { Token: token } })
							.then(res => setFinished(false))
							.catch(err => console.error(err.response));
					}}>Mark as undone (only for testing!)</button>}
			</Accordion> : 'Loading...'}
		</div>
	);
}

export default UnitCard;