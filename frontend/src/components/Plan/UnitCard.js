import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';
import Accordion from '../Accordion/Accordion';

function UnitCard({ className, name, rep }) {
	const [data, setData] = useState(null);

	useEffect(() => {
		axiosInstance.get(`/wikiHow/${name}`)
			.then(({ data }) => setData(data))
			.catch(err => console.error(err));
	}, []);

	return (
		<div className={`card ${className}`}>
			{data ? <Accordion title={`${name} (${rep} Iteration${rep > 1 ? 's' : ''})`} >
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
				<button className='btn btn-success btn-block'>Mark as done</button>
			</Accordion> : 'Loading...'}
		</div>
	);
}

export default UnitCard;