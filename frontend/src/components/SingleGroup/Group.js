import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import useWebSocket from 'react-use-websocket';
import UnitCard from './UnitCard';
import Modal from '../Modal/Modal';

function EditGroup({ showEditGroup, gname, id, setGroup}) {
	const [error, setError] = useState('');
	const [image, setImage] = useState(null);
	const [token, uid, logout] = useUser();

	return (
		<div>
			<div className='text-center text-danger mb-2'>{error}</div>
			{image && <img className='img-fluid rounded mb-3 shadow' style={{ objectFit: 'cover' }} src={image.url} width='400rem' />}
			{image && <hr />}
			<form>
				<div className='form-group'>
					<label>New Group Picture</label>
					<div className='border p-1'>
						<input className='d-none' id='select-file' type='file' accept='image/jpg, image/jpeg' onInput={e => {
							let file = e.target.files[0];
							let reader = new FileReader();
							var size = file.size;
							if(size <= 1e6) {
								reader.onload = e => setImage({ file: file, url: URL.createObjectURL(file), name: file.name, rawBytes: e.target.result });
								reader.readAsBinaryString(file);
							}
							else
								setError('Image File cannot be larger than 1mb')
						}} />
						<button className='btn btn-outline-secondary' onClick={e => {
							document.getElementById('select-file').click();
							e.preventDefault();
						}}>Select Picture</button>
						{image && <img className='rounded-circle ml-3' style={{ objectFit: 'cover' }} src={image.url} width='40em' height='40em' />}
						<span className='ml-3 text-muted'>{image ? image.name : 'Nothing selected'}</span>
						{image && <div className='btn float-right' onClick={e => {
							setImage(null);
							document.getElementById('select-file').value = '';
						}}>X</div>}
					</div>
				</div>
			</form>
			<button className='btn btn-success' disabled={!image} onClick={() => {
			}}>Save</button>
			<button className='btn btn-outline-danger float-right' onClick={() => { showEditGroup(false); setError(''); setImage(null) }} >Cancel</button>
		</div>
	);
}

function Group({ className, match }) {
	const [token, uid] = useUser();
	const { lastMessage, sendJsonMessage } = useWebSocket('ws://localhost:4000');
	const [group, setGroup] = useState(null);
	const [memberNames, setMemberNames] = useState([]);
	const [members, setMembers] = useState([]);
	const [plan, setPlan] = useState();
	const [copied, setCopied] = useState(false);
	const [finishedPerUnit, setFinishedPerUnit] = useState([]);
	const [editGroup, showEditGroup] = useState(false);

	useEffect(() => {
		sendJsonMessage({ 'uid': uid, 'token': token });
	}, [uid, token]);

	useEffect(() => {
		axiosInstance.get(`/group/${match.params.group_id}`, { headers: { Token: token, uid: uid } })
			.then(({ data }) => {
				setGroup(data);
				setMembers(data.members)
			})
			.catch(err => console.error(err));
	}, [token, uid, match.params.group_id]);

	useEffect(() => {
		axiosInstance.get(`/group/${match.params.group_id}/plan`, { headers: { Token: token, uid: uid } })
			.then(({ data }) => setPlan(data))
			.catch(err => console.error(err));
	}, [token, uid, match.params.group_id]);

	useEffect(() => {
		let pArr = [];
		members.map(member => pArr.push(axiosInstance.get(`/user/${member}/name`)));
		Promise.allSettled(pArr).then(results => setMemberNames(results.map(({ value }) => value.data)));
	}, [members]);

	useEffect(() => {
		if (plan)
			setFinishedPerUnit(plan.units.map(({ finished }) => finished.filter(({ finished }) => finished).map(({ uid }) => uid)));
	}, [plan]);

	useEffect(() => {
		if (!lastMessage)
			return
		const data = JSON.parse(lastMessage.data)
		if (data.target.startsWith('group.members.') && data.body.group === match.params.group_id) {
			if (data.target.startsWith('group.members.add')) {
				if (!members.includes(data.body.member))
					setMembers([...members, data.body.member])
			} else if (data.target.startsWith('group.members.remove')) {
				setMembers(members.filter(elem => elem !== data.body.member))
			}
		} else if (data.target.startsWith('group.plan.finished') && data.body.group === match.params.group_id) {
			if (data.target.startsWith('group.plan.finished.add')) {
				const tempF = finishedPerUnit;
				const i = plan.units.findIndex(({ _id }) => _id == data.body.unit);
				if (finishedPerUnit[i].includes(data.body.member))
					return
				tempF[i].push(data.body.member);
				setFinishedPerUnit([...tempF]);
			} else if (data.target.startsWith('group.plan.finished.remove')) {
				const tempF = finishedPerUnit;
				const i = plan.units.findIndex(({ _id }) => _id == data.body.unit);
				const j = tempF.indexOf(data.body.member);
				tempF[i].splice(j, 1);
				setFinishedPerUnit([...tempF]);
			}
		}
	}, [lastMessage]);

	return (
		group && <div className='m-3'>
			<Modal closeOnClickOutside={false} showModal={editGroup} showModalHook={showEditGroup}>
				<EditGroup showEditGroup={showEditGroup} gname={group.gname} id={group._id} setGroup={setGroup}/>
			</Modal>

			<h1 className='display-3 text-center' onChange={e => console.log(e.target.value)}>{group.gname}</h1>
			<img className='img-fluid rounded d-sm-none mb-4' alt='Grouppicture' src={group.img} />
			<div className={`row align-items-start ${!plan ? 'align-items-center' : ''}`}>
				<div className='col-sm-8'>
					{plan ?
						<div className={className}>
							{plan && finishedPerUnit && plan.units.map(({ rep, name, _id }, i) => {
								return (
									<div key={_id} className='m-3'>
										<UnitCard name={name} rep={rep} unit_id={_id} finished={finishedPerUnit} i={i} group_id={match.params.group_id} />
									</div>
								)
							})}
						</div>
						:
						<div className='text-center col-auto card bg-light py-3 m-5'>
							<h2>Looks like you're all lazy. There is currently no Plan!</h2>
							<a className='h4' href='/area'>Go ahed and add one!</a>
						</div>}
				</div>
				<div className='col-sm-4'>
					<img className='img-fluid rounded row-auto d-none d-sm-inline-block mb-4' alt='Grouppicture' src={group.img} />
					<button className='btn btn-block mb-3 btn-primary' onClick={() => showEditGroup(true)}>Edit Group</button>
					<div className='row-auto mb-4'>
						<ul className='list-group'>
							{memberNames.map(member => <li className='list-group-item' key={member}>{member}</li>)}
						</ul>
					</div>
					<div className='btn-group-vertical d-flex'>
						<button className='btn btn-block btn-primary' onClick={() => {
							let link = `${process.env.REACT_APP_FRONTEND_BASE}groups/${group._id}/join`;
							navigator.clipboard.writeText(link)
								.then(() => setCopied(true))
								.catch((err) => console.error('Async: Could not copy text: ', err));
						}}>Copy Invitation Link {copied ? '(Copied!)' : ''}</button>
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