import { useEffect, useState } from 'react';

import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import Modal from '../Modal/Modal';

import JoinGroupIcon from '../../image/join_group.svg';
import AddGroupIcon from '../../image/add.svg';
import Card from '../Cards/Card';
import getBase64ImageData from '../../tools/getBase64ImageData';

function JoinGroup({ join, joinLink, setJoinLink }) {
	const [token, uid] = useUser();
	const [error, setError] = useState('');

	return (
		<div>
			<div className='text-center text-danger mb-2'>{error}</div>
			<form>
				<label>Invitation Link</label>
				<input className='form-control' type='url' placeholder='Put your Invitation Link here...' value={joinLink} onChange={e => setJoinLink(e.target.value)} />
			</form>
			<button className='btn btn-success mt-3' onClick={() => {
				if (joinLink === '') {
					setError('No Link was given');
					return;
				}
				const match = /(?:http[s]?:\/\/)?[a-zA-Z0-9.]*(?::[0-9]*)?\/groups\/([0-9]{10})\/join/i.exec(joinLink);
				if (!match) {
					setError('Invalid Invitation Link');
					return;
				}
				const gid = match[1];
				axiosInstance.post(`/group/${gid}/${uid}`, null, { headers: { Token: token } })
					.then(_ => window.location.href = `/groups/${gid}`)
					.catch(err => setError(err.response));

			}}>Join Group</button>
			<button className='btn btn-outline-danger mt-3 float-right' onClick={() => { join(false); setError(''); setJoinLink('') }} >Cancel</button>
		</div>
	);
}

function AddGroup({ add, gname, setName, image, setImage }) {
	const [error, setError] = useState('');
	const [token, uid] = useUser();

	return (
		<div>
			<div className='text-center text-danger mb-2'>{error}</div>
			<h1 className='display-4'>{gname}</h1>
			{image && <img className='img-fluid rounded mb-3 shadow' style={{ objectFit: 'cover' }} src={image.url} alt='Group Pic.' width='400rem' />}
			{(gname || image) && <hr />}
			<form>
				<div className='form-group'>
					<label>Group Name</label>
					<sup className='text-danger'>*</sup>
					<div className='input-group mb-3'>
						<input className='form-control' placeholder='Enter Group Name' value={gname} onChange={e => setName(e.target.value)} />
					</div>
				</div>
				<div className='form-group'>
					<label>Group Picture</label>
					<div className='border p-1'>
						<input className='d-none' id='select-file' type='file' onInput={e => {
							let file = e.target.files[0];
							var size = file.size;
							if(size > 1e6) {
								setError('Image File cannot be larger than 1mb');
								return;
							}
							getBase64ImageData(URL.createObjectURL(file)).then(data =>
								setImage({ file: file, url: URL.createObjectURL(file), name: file.name, rawBytes: data }));
						}} />
						<button className='btn btn-outline-secondary' onClick={e => {
							document.getElementById('select-file').click();
							e.preventDefault();
						}}>Select Picture</button>
						{image && <img className='rounded-circle ml-3' style={{ objectFit: 'cover' }} src={image.url} alt='Groupimage' width='40em' height='40em' />}
						<span className='ml-3 text-muted'>{image ? image.name : 'Nothing selected'}</span>
						{image && <div className='btn float-right' onClick={e => {
							setImage(null);
							document.getElementById('select-file').value = '';
						}}>X</div>}
					</div>
				</div>
			</form>
			<small className='d-block mb-4 text-secondary'>
				<sup className='text-danger'>*</sup> required
			</small>
			<button className='btn btn-success' disabled={!gname} onClick={() => {
				if(image)
					axiosInstance.post(`/group`, {'gname': gname, 'rawImg': image.rawBytes }, {headers: { Token: token, uid: uid }})
						.then(({data}) => window.location.href = `/groups/${data.gid}`)
						.catch(err => console.error(err));
				else
					axiosInstance.post(`/group`, {'gname': gname }, {headers: { Token: token, uid: uid }})
						.then(({data}) => window.location.href = `/groups/${data.gid}`)
						.catch(err => console.error(err.response));
			}}>Add Group</button>
			<button className='btn btn-outline-danger float-right' onClick={() => { add(false); setError(''); setImage(null); setName('') }} >Cancel</button>
		</div>
	);
}


function AllGroups({ className }) {
	const [token, uid] = useUser();
	const [groups, setGroups] = useState([]);
	const [join, showJoinGroup] = useState(false);
	const [add, showAddGroup] = useState(false);
	const [joinLink, setJoinLink] = useState('');
	const [gname, setName] = useState('');
	const [image, setImage] = useState(null);

	useEffect(() => {
		axiosInstance.get(`/user/${uid}/groups`, { headers: { Token: token } })
			.then(({ data }) => setGroups(data))
			.catch(err => err.response && console.error(err.response));
	}, [uid, token]);

	return (
		<div className={`${className}`}>
			<h1 className='display-3 text-center'>Groups</h1>
			<Modal showModal={join} showModalHook={r => {
				showJoinGroup(r);
				setJoinLink('');
			}}>
				<JoinGroup joinLink={joinLink} setJoinLink={setJoinLink} join={showJoinGroup} />
			</Modal>
			<Modal showModal={add} showModalHook={r => {
				showAddGroup(r);
				setName('');
				setImage(null);
			}}>
				<AddGroup gname={gname} setName={setName} image={image} setImage={setImage} add={showAddGroup} />
			</Modal>
			<div className='d-inline-flex flex-wrap justify-content-center mt-3 ml-3'>
				{groups.map(({ gname, img, _id }, i) => {return (
					<Card className='shadow-lg m-3' key={i} onClick={() => window.location.href = `/groups/${_id}`} img={img} >
						<h5 className='text-center'>{gname}</h5>
					</Card>
				)
				})}
				<Card className='shadow-lg m-2' img={JoinGroupIcon} onClick={() => showJoinGroup(true)}><h5 className='text-center'>Join Group</h5></Card>
				<Card className='shadow-lg m-2' img={AddGroupIcon} onClick={() => showAddGroup(true)}><h5 className='text-center'>Add Group</h5></Card>
			</div>
		</div>
	);
}

export default AllGroups;