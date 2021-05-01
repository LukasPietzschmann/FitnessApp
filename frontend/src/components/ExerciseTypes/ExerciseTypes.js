import { useState, useEffect } from 'react';
import ExerciseTypeCards from './ExerciseTypesCards';

function ExerciseTypes({ className, id }) {
	const [cards, setCards] = useState([]);

	useEffect(() => {
		if (id === 'chest') {
			setCards([
				{
					title: 'Chest Press',
					target: '/test'
				},
				{
					title: 'Pushups',
					target: '/test'
				}
			]);
		}

		else if (id === 'legs') {
			setCards([
				{
					title: 'Leg Press',
					target: '/test'
				},
				{
					title: 'Calf Raises',
					target: '/test'
				}
			]);
		}

		else if (id === 'booty') {
			setCards([
				{
					title: 'Squats',
					target: '/test'
				},
				{
					title: 'Sumo Squats',
					target: '/test'
				}
			]);
		}
	}, []);

	return (
		<div>
			<div className='d-flex flex-column justify-content-around align-items-center' style={{ height: '80vh' }}>
				{cards.map(({ title, target }, i) => <ExerciseTypeCards className='shadow-lg bg-light' key={i} title={title} target={target} />)}
			</div>
		</div>
	);
}

export default ExerciseTypes;