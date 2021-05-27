import { useEffect, useState } from 'react';

import useUser from '../../hooks/useUser';
import { axiosInstance } from '../../constants';

function Login({ className, style }) {
	const [uname, setUName] = useState('');
	const [passwd, setPasswd] = useState('');
	const [error, setError] = useState(null);

	const [token, uid, logout] = useUser();

	useEffect(() => {
		if (token && uid)
			axiosInstance.get(`/user/${uid}`, { headers: { Token: token } })
				.then(({ data }) => setError(`You (${data.uname}) are already logged in!`))
				.catch(err => console.error(err));
	}, [token, uid]);

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
				<button className='btn btn-success btn-disabled' disabled={token && uid} onClick={() => {
					axiosInstance.post('/login', {uname: uname, password: hash(passwd)}, {withCredentials: true})
						.then((r) => {window.location.href = '/';console.log(r)})
						.catch(err => {
							console.error(err);
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

function hash(str) {
	var hash = 0, i, chr;
	if (str === 0) return hash;
	for (i = 0; i < str.length; i++) {
	  chr   = str.charCodeAt(i);
	  hash  = ((hash << 5) - hash) + chr;
	  hash |= 0; }
	return hash;
  }

export default Login;