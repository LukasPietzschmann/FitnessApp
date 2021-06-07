import { useEffect, useState } from 'react';
import { axiosInstance } from '../../constants';

import useUser from '../../hooks/useUser';
import logo from '../../image/logo.png';
import profilPic from '../../image/sample-profile.png';


function Header({ className }) {
	const [token, uid, logout] = useUser();
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
				<text className='text-light'>Crush It</text>
			</a>
			<a href='/profile'>
				<img className='rounded-circle' src={userData && userData.img ? userData.img : profilPic} height='50rem' width='50rem' alt='Profile picture' style={{objectFit: 'cover'}} />
			</a>
		</nav>

	);
}

// Green: 0cab43
// Blue: 1995d1
//Orange: eb7b05
// Purple: 7312db

// Lukas Blue 01: a7c5eb
// Lukas Blue 02: b0deff
export default Header;