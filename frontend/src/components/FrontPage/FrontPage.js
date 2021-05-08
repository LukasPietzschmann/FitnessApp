import FrontPageCard from './FrontPageCard';
import AccountHeader from './AccountHeader';

import Sport from '../../image/sport.png';
import Shopping from '../../image/shopping.png';
import Group from '../../image/group.png';

function FrontPage({ className }) {
	const cards = [
		{
			title: 'Sport',
			desc: 'Erstelle einen neuen Trainingsplan, um deinen Körper fit zu halten!',
			target: '/areaChoice',
			img: Sport
		},
		{
			title: 'Gruppen',
			desc: 'Zusammen macht alles mehr Spaß. Trainiere zusammen mit deinen Freunden und teilt euren Vortschritt!',
			target: '/groups',
			img: Group
		},
		{
			title: 'Shopping',
			desc: 'Shoppe neues Equipment, um neue Trainings-Methoden zu entdecken!',
			target: '/areaChoice',
			img: Shopping
		}
	];

	return (
		<div className={`${className}`}>
			<AccountHeader className='mt-2' />
			<div className='d-flex justify-content-around align-items-center' style={{ height: '70vh' }}>
				{cards.map(({ title, desc, target, img }, i) => <FrontPageCard className='shadow-lg m-3' key={i} title={title} desc={desc} target={target} img={img} />)}
			</div>
		</div>
	);
}

export default FrontPage;