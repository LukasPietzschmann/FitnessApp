import legs from '../../image/legs.png';
import upperBody from '../../image/upperBody.jpg';
import wholeBody from '../../image/wholeBody.jpg'
import AreaChoicePage from './AreaChoiceCard';


function AreaChoice({ className }) {
	const cards = [
		{
			title: 'Upper body',
			img: upperBody,
			target: '/areaChoice/test'
		},
		{
			title: 'Lower body',
			img: legs,
			target: '/areaChoice/test'
		},
		{
			title: 'Whole body',
			img: wholeBody,
			target: '/areaChoice/test'
		}

	];

	return (
		<div className={`${className}`}>
			<div>
				<h1 className='display-3 ml-5'>Choose your training area</h1>
			</div>
			<div className='d-flex justify-content-around align-items-center' style={{height: '85vh'}}>
			{cards.map(({ title, img, target }, i) => <AreaChoicePage className='shadow-lg' key={i} title={title} target={target} img={img} />)}
			</div>
		</div>
	);
}

export default AreaChoice;