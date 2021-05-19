import legs from '../../image/legs.png';
import upperBody from '../../image/upperBody.jpg';
import fullBody from '../../image/fullBody.jpg'
import AreaChoiceCard from './AreaChoiceCard';

import Card from '../Cards/Card';

function AreaChoice({ className }) {
	const cards = [
		{
			title: 'Upper body',
			img: upperBody,
			target: '/areaChoice/UpperBody'
		},
		{
			title: 'Lower body',
			img: legs,
			target: '/areaChoice/LowerBody'
		},
		{
			title: 'Full body',
			img: fullBody,
			target: '/areaChoice/FullBody'
		}

	];

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