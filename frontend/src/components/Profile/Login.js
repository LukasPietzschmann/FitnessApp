import { useState } from 'react';

import { axiosInstance } from '../../constants';

function Login({ className }) {
	const [uname, setUName] = useState('');
	const [passwd, setPasswd] = useState('');
	const [error, setError] = useState(null);

	return (
		<div className={className}>
			<h1 className='display-3'>Login</h1>
			<form>
				<div className='form-group'>
					<label>Username</label>
					<div className='input-group mb-3'>
						<div className='input-group-prepend'>
							<span className='input-group-text'>@</span>
						</div>
						<input className='form-control' placeholder='Enter Username' value={uname} onChange={e => setUName(e.target.value)}/>
					</div>
				</div>
				<div className='form-group'>
					<label>Password</label>
					<input className='form-control' type='password' placeholder='Enter Password' value={passwd} onChange={e => setPasswd(e.target.value)}/>
				</div>
			</form>
			<button className='btn btn-success' onClick={() => {
				axiosInstance.post('/login', {uname: uname, password: passwd}, {withCredentials: true})
					.then(() => window.location.reload())
					.catch(err => {
						console.error(err.response);
						if (err.response.status === 400)
							setError(err.response.data);
					});
			}}>Login</button>
			<div className='d-inline text-danger ml-2'>{error}</div>
		</div>
	);
}

export default Login;