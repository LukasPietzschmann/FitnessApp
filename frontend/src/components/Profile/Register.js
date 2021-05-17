import { useState } from 'react';

import { axiosInstance } from '../../constants';
import uploadToBlob from '../../tools/uploadToBlob';

function Register({ className, style }) {
	const [uname, setUName] = useState('');
	const [passwd, setPasswd] = useState('');
	const [name, setName] = useState('');
	const [mail, setMail] = useState('');
	const [home, setHome] = useState('');
	const [image, setImage] = useState(null)
	const [error, setError] = useState(null);

	return (
		<div className={className} style={style}>
			<h1 className='display-3 text-center'>Register</h1>
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
					<div className='border p-1'>
						<input className='d-none' id='select-file' type='file' onInput={e => {
							let file = e.target.files[0];
							let reader = new FileReader();
							reader.onload = e => setImage({ file: file, url: URL.createObjectURL(file), name: file.name, rawBytes: e.target.result });
							reader.readAsBinaryString(file);
						}}/>
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
			<small className='d-block mb-4 text-secondary'>
				<sup className='text-danger'>*</sup> required
			</small>
			<div className='text-center'>
				<button className='btn btn-success' onClick={() => {
					new Promise((resolve, reject) => {
						if (image)
							uploadToBlob(`${uname}-profile-pic.jpg`, image.file).then(({ url, deleteBlob }) => {
								axiosInstance.post('/user', { uname: uname, password: passwd, name: name, mail: mail, address: home, img: url })
									.then(resolve)
									.catch(err => {
										deleteBlob();
										reject(err);
									});
							})
						else
							axiosInstance.post('/user', { uname: uname, password: passwd, name: name, mail: mail, address: home })
								.then(resolve)
								.catch(err => reject(err));
					}).then(res => window.location.href = '/login')
						.catch(err => {
							console.log(err, err.response);
							if (err.response && err.response.status === 400)
								setError(err.response.data);
						})
				}}>Register</button>
			</div>
			<div className='d-inline text-danger m-2'>{error}</div>
			<div className='text-center m-4'><a href='/login'>You already have an Account? Login here!</a></div>
		</div>
	);
}

export default Register;