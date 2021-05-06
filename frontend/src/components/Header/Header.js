import logo from '../../image/logo.png';
import profilPic from '../../image/sample-profile.png';


function Header({ className }) {
	return (
		<nav className={`navbar navbar-light shadow ${className}`} style={{backgroundColor: '#1995d1'}}>
			<a className='navbar-brand' href='/'>
				<img className='align-center mr-2' src={logo} height='40rem' alt='Logo' />
				<text className='text-light'>App-Name</text>
			</a>
			<a href='/profile'>
				<img className='rounded-circle' src={profilPic} height='50rem' alt='Profile picture' />
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