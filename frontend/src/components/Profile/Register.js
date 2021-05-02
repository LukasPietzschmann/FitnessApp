import { useState } from 'react';

import { axiosInstance } from '../../constants';

function Register({ className }) {
	const [uname, setUName] = useState('');
	const [passwd, setPasswd] = useState('');
	const [name, setName] = useState('');
	const [mail, setMail] = useState('');
	const [home, setHome] = useState('');
	const [image, setImage] = useState(null)
	const [error, setError] = useState(null);

	return (
		<div className={className}>
			<h1 className='display-3'>Register</h1>
			<form>
				<div className='form-group'>
					<label>Username</label>
					<sup className='text-danger'>*</sup>
					<div className='input-group mb-3'>
						<div className='input-group-prepend'>
							<span className='input-group-text'>@</span>
						</div>
						<input className='form-control' placeholder='Enter Username' value={uname} onChange={e => setUName(e.target.value)} />
					</div>
				</div>
				<div className='form-group'>
					<label>Password</label>
					<sup className='text-danger'>*</sup>
					<input className='form-control' type='password' placeholder='Enter Password' value={passwd} onChange={e => setPasswd(e.target.value)} />
				</div>
				<div className='form-group'>
					<label>Whole Name</label>
					<input className='form-control' placeholder='Enter your whole Name' value={name} onChange={e => setName(e.target.value)} />
				</div>
				<div className='form-group'>
					<label>E-Mail</label>
					<input className='form-control' type='email' placeholder='Enter your E-Mail' value={mail} onChange={e => setMail(e.target.value)} />
					<small>We promise we won't share this with anybody</small>
				</div>
				<div className='form-group'>
					<label>Address</label>
					<input className='form-control' placeholder='Enter your Address' value={home} onChange={e => setHome(e.target.value)} />
				</div>
				<div className='form-group'>
					<label>Profile Picture</label>
					<input className='form-control-file' type='file' accept="image/*" onChange={e => setImage(e.target.files[0])} />
				</div>
			</form>
			<small className='d-block mb-4 text-secondary'>
				<sup className='text-danger'>*</sup> required
			</small>
			<button className='btn btn-success' onClick={() => { //TODO upload image
				axiosInstance.post('/user', { uname: uname, password: passwd, name: name, mail: mail, address: home}, { withCredentials: true })
					.then(() => window.location.reload())
					.catch(err => {
						console.error(err.response);
						if (err.response.status === 400)
							setError(err.response.data);
					});
			}}>Register</button>
			<div className='d-inline text-danger ml-2'>{error}</div>
		</div>
	);
}

export default Register;