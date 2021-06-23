import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import Accordion from '../Accordion/Accordion';

function UnitCard({ className, unit_id, plan_id, name, rep, finished, updateFinished }) {
	const [token, uid] = useUser();
	const [data, setData] = useState(null);

	useEffect(() => {
		axiosInstance.get(`/wikiHow/${name}`)
			.then(({ data }) => setData(data))
			.catch(err => console.error(err));
	}, [name]);

	return (
		<div className={`card ${className}`}>
			{data ? <Accordion className={`${finished ? 'border border-success' : ''} bg-light`} title={`${name} (${rep} Iteration${rep > 1 ? 's' : ''}) ${finished ? '✓' : ''}`} >
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
				{!finished ? <button className='btn btn-success btn-block' onClick={() => {
					axiosInstance.put(`/user/${uid}/plan/${plan_id}`, { "unit_id": unit_id, "finished": true }, { headers: { Token: token } })
						.then(_ => updateFinished(true))
						.catch(err => console.error(err.response));
				}}>Mark as done</button> :
					<button className='btn btn-dark btn-block' onClick={() => {
						axiosInstance.put(`/user/${uid}/plan/${plan_id}`, { "unit_id": unit_id, "finished": false }, { headers: { Token: token } })
							.then(_ => updateFinished(false))
							.catch(err => console.error(err.response));
					}}>Mark as undone (only for testing!)</button>}
			</Accordion> : 'Loading...'}
		</div>
	);
}

export default UnitCard;