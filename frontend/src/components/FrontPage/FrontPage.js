import AccountHeader from './AccountHeader';
import Card from '../Cards/Card';

import Sport from '../../image/sport.png';
import Shopping from '../../image/shopping.png';
import Group from '../../image/group.png';
import CurrentPlan from './CurrentPlan';

function FrontPage({ className }) {
	const cards = [
		{
			title: 'Sports',
			desc: 'Create a new workout plan to keep your body fit and in shape!',
			target: '/areaChoice',
			img: Sport
		},
		{
			title: 'Groups',
			desc: 'Everything is more fun together. Woukout together with your friends and share your progress!',
			target: '/groups',
			img: Group
		},
		{
			title: 'Shopping',
			desc: 'Shop new equipment to discover new training methods!',
			target: '/areaChoice',
			img: Shopping
		}
	];

	return (
		<div className={`${className}`}>
			<AccountHeader className='mt-2' />
			<CurrentPlan className='mx-5 mt-5 p-2' />
			<div className='d-flex justify-content-around align-items-center' style={{ height: '70vh' }}>
				{cards.map(({ target, img, title, desc }, i) => { return (
					<Card className='shadow-lg m-3' key={i} onClick={() => window.location.href = target} img={img}>
						<h5 className='card-title'>{title}</h5>
						<p className='card-text'>{desc}</p>
					</Card>
				)})}
			</div>
		</div>
	);
}

export default FrontPage;