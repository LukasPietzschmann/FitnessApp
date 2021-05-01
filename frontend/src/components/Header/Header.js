import logo from '../../image/logo.png';
import profilPic from '../../image/sample-profile.png';


function Header({ className }) {
	return (
		<nav className={`navbar navbar-light shadow ${className}`}>
			<a className='navbar-brand' href='/'>
				<img className='align-center mr-2' src={logo} height='40rem' alt='Logo' />
				App-Name
			</a>
			<a href='/profile'>
				<img className='rounded-circle' src={profilPic} height='50rem' alt='Profile picture' />
			</a>
		</nav>

	);
}


export default Header;