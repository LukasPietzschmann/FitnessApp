import { useState } from 'react';

import { axiosInstance } from '../../constants';

function Login({ className, style }) {
	const [uname, setUName] = useState('');
	const [passwd, setPasswd] = useState('');
	const [error, setError] = useState(null);

	return (
		<div className={`${className}`} style={style}>
			<h1 className='display-3 text-center'>Login</h1>
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
			<div className='text-center'>
				<button className='btn btn-success' onClick={() => {
					axiosInstance.post('/login', {uname: uname, password: passwd}, {withCredentials: true})
						.then(() => window.location.href = '/')
						.catch(err => {
							console.error(err.response);
							if (err.response && err.response.status === 400)
								setError(err.response.data);
						});
				}}>Login</button>
				</div>
			<div className='text-center text-danger m-2'>{error}</div>
			<div className='text-center m-4'><a href='/register'>No Account yet? Register here!</a></div>
		</div>
	);
}

export default Login;