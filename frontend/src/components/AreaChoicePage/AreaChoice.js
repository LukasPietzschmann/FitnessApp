import legs from '../../image/legs.png';
import upperBody from '../../image/upperBody.jpg';
import fullBody from '../../image/fullBody.jpg'
import AreaChoiceCard from './AreaChoiceCard';


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
			<div className='d-flex justify-content-around align-items-center' style={{height: '85vh'}}>
			{cards.map(({ title, img, target }, i) => <AreaChoiceCard className='shadow-lg' key={i} title={title} target={target} img={img} />)}
			</div>
		</div>
	);
}

export default AreaChoice;