import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import chest_press from '../../image/chest-press.jpg';
import PlanCard from './PlanCard.js';


function Group({ className, match }) {
	const [token, uid, logout] = useUser();
	const [group, setGroup] = useState(null);
	const [memberNames, setMemberNames] = useState([]);

	useEffect(() => {
		axiosInstance.get(`/group/${match.params.group_id}`, { headers: { Token: token, uid: uid } })
			.then(({ data }) => {
				setGroup(data);
				let pArr = [];
				data.members.map(member => pArr.push(axiosInstance.get(`/user/${member}/name`)));
				Promise.allSettled(pArr).then(results => setMemberNames(results.map(({ value }) => value.data)));
			})
			.catch(err => console.error(err));
	}, []);

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
			<h1 className='display-3 text-center'>{group && group.gname}</h1>
			<div className='float-left d-inline-flex' style={{ height: '50rem', width: '120vh' }}>
				{cards.map(({ title, img}, i) => <PlanCard className='shadow-lg ml-1' key={i} title={title} img={img} />)}
			</div>
			<div>
				<ul className='list-group'>
					{memberNames.map(member => <li className='list-group-item' key={member}>{member}</li>)}
				</ul>
			</div>
			<button className='btn btn-outline-primary' onClick={() => {
				//TODO prefix with FrontendServer IP
				let link = `http://localhost:3000/groups/${group._id}/join`;
				navigator.clipboard.writeText(link)
					.then(() => console.log('Async: Copying to clipboard was successful!'))
					.catch((err) => console.error('Async: Could not copy text: ', err));
			}}>Copy Invitation Link</button>
			<button className='btn btn-outline-danger' onClick={() => {
				axiosInstance.delete(`/group/${group._id}/${uid}`, { headers: { Token: token } })
					.then(res => window.location.href = "/")
					.catch(err => console.error(err.response));
			}}>Leave Group</button>
		</div>
	);
}

export default Group;