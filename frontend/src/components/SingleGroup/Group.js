import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import chest_press from '../../image/chest-press.jpg';
import Card from '../Cards/Card';


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
		group && <div className='m-3'>
			<h1 className='display-3 text-center' onChange={e => console.log(e.target.value)}>{group.gname}</h1>
			<div className='row'>
				<div className='col-9 d-flex flex-wrap justify-content-around'>
					{cards.map(({ title, img }, i) => {return (
						<Card className='shadow-lg m-2' key={i} img={img}><h5 className='text-center'>{title}</h5></Card>)
					})}
				</div>
				<div className='col'>
					<img className='img-fluid rounded row-auto mb-4' alt={`${group.gname} Picture`} src={group.img} />
					<div className='row-auto mb-4'>
						<ul className='list-group'>
							{memberNames.map(member => <li className='list-group-item' key={member}>{member}</li>)}
						</ul>
					</div>
					<div className='btn-group-vertical d-flex'>
						<button className='btn btn-block btn-primary' onClick={() => {
							let link = `${process.env.REACT_APP_FRONTEND_BASE}groups/${group._id}/join`;
							navigator.clipboard.writeText(link)
								.then(() => console.log('Async: Copying to clipboard was successful!'))
								.catch((err) => console.error('Async: Could not copy text: ', err));
						}}>Copy Invitation Link</button>
						<button className='btn btn-block btn-outline-danger' onClick={() => {
							axiosInstance.delete(`/group/${group._id}/${uid}`, { headers: { Token: token } })
								.then(res => window.location.href = "/")
								.catch(err => console.error(err.response));
						}}>Leave Group</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Group;