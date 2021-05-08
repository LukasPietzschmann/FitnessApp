import { useEffect, useState } from 'react';

import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import GroupCard from './GroupCard.js';


function AllGroups({ className }) {
	const [token, uid, logout] = useUser();
	const [groups, setGroups] = useState([]);

	useEffect(() => {
		axiosInstance.get(`/user/${uid}/groups`, { headers: { Token: token } })
			.then(({data}) => setGroups(data))
			.catch(err => err.response && console.error(err.response));
	}, [uid, token]);

	return (
		<div className={`${className}`}>
			<div className='d-inline-flex mt-3 ml-3'>
				{groups.map(({ gname, img, _id }, i) => <GroupCard className='shadow-lg ml-1' key={i} title={gname} target={`/groups/${_id}`} img={img} />)}
			</div>
		</div>
	);
}

export default AllGroups;