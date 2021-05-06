import chest_press from '../../image/chest-press.jpg';
import GroupOverlayCard from './GroupOverlayCard.js';


function GroupOverlay({ className }) {
	const cards = [
		{
			title: 'test1',
			img: chest_press
		},
		{
			title: 'test2',
			img: chest_press
		},
		{
			title: 'test3',
			img: chest_press
		},
		{
			title: 'test4',
			img: chest_press
		}
	]
	return (
		<div className='mt-4 ml-4 mr-4'>
			<div className='float-left d-inline-flex' style={{ height: '50rem', width: '120vh' }}>
				{cards.map(({ title, img}, i) => <GroupOverlayCard className='shadow-lg ml-1' key={i} title={title} img={img} />)}
			</div>
			<div className='float-right'> woooo</div>
		</div>
	);
}

export default GroupOverlay;