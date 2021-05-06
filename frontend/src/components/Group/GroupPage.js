import group from '../../image/Group.jpg';
import GroupCard from './GroupPageCard.js';


function Group({ className }) {
	const cards = [
		{
			title: 'Group 01',
			target: '/Group/GroupOverlay',
			img: group
		},
		{
			title: 'Group 02',
			target: '/Group/GroupOverlay',
			img: group
		}
	]
	return (
		<div className={`${className}`}>
			<div className='d-inline-flex mt-3 ml-3'>
				{cards.map(({ title, img, target }, i) => <GroupCard className='shadow-lg ml-1' key={i} title={title} target={target} img={img} />)}
			</div>
		</div>
	);
}

export default Group;