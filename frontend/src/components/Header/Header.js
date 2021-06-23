/**
 * @author Lukas Pietzschmann, Vincent Ugrai
 */

import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';

import useUser from '../../hooks/useUser';
import logo from '../../image/logo.png';
import profilPic from '../../image/sample-profile.png';


function Header({ className }) {
	const [token, uid] = useUser();
	const [userData, setUserData] = useState(null);

	useEffect(() => {
		axiosInstance.get(`/user/${uid}`, { headers: { Token: token } })
				.then(({ data }) => setUserData(data))
				.catch(err => console.error(err));
	}, [uid, token]);

	return (
		<nav className={`navbar navbar-light shadow bg-primary ${className}`}>
			<a className='navbar-brand' href='/'>
				<img className='align-center mr-2' src={logo} height='40rem' alt='Logo' />
				<span className='text-light'>Crush It</span>
			</a>
			<a href='/profile'>
				<img className='rounded-circle' src={userData && userData.img ? userData.img : profilPic} height='50rem' width='50rem' alt='Profile Pic.' style={{objectFit: 'cover'}} />
			</a>
		</nav>

	);
}

export default Header;