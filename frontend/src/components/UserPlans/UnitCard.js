/**
 * @author Lukas Pietzschmann
 */

import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import Accordion from '../Accordion/Accordion';

/**
 *
 * @param className The className always gets forwarded to the Top-Level Element of the Component. This enables Styling 'from outside'.
 * @param unit_id The Units ID.
 * @param plan_id The Plans ID.
 * @param name The Units Name.
 * @param rep The number of repetitions of the Unit.
 * @param finished If the User finished this Unit, this will be true, otherwise false,
 * @param updateFinished If the User marks this Unit as finished, this Method should be called.
 */
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
					''}
			</Accordion> : 'Loading...'}
		</div>
	);
}

export default UnitCard;