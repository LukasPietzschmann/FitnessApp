import { useState, useEffect } from 'react';
import ExerciseAreaTypesCard from './ExerciseAreaTypesCard';

function ExerciseAreaTypes({ className, id }) {
	const [cards, setCards] = useState([]);

	useEffect(() => {
		if (id === 'upper') {
			setCards([
				{
					title: 'Chest',
					target: '/areaChoice/UpperBody/Chest'
				},
				{
					title: 'Back',
					target: '/areaChoice/UpperBody/Chest'
				}
			]);
		}

		else if (id === 'lower') {
			setCards([
				{
					title: 'Legs',
					target: '/areaChoice/LowerBody/Legs'
				},
				{
					title: 'Booty',
					target: '/areaChoice/LowerBody/Booty'
				}
			]);
		}

		else if (id === 'full') {
			setCards([
				{
					title: 'Chest',
					target: '/areaChoice/FullBody/Chest'
				},
				{
					title: 'Arms',
					target: '/areaChoice/FullBody/test'
				},
				{
					title: 'Legs',
					target: '/areaChoice/FullBody/Legs'
				},
				{
					title: 'Booty',
					target: '/areaChoice/FullBody/Booty'
				}
			]);
		}
	}, []);

	return (
		<div>
			<div className='d-flex flex-column justify-content-around align-items-center' style={{ height: '80vh' }}>
				{cards.map(({ title, target }, i) => <ExerciseAreaTypesCard className='shadow-lg bg-light' key={i} title={title} target={target} />)}
			</div>
		</div>
	);
}

export default ExerciseAreaTypes;