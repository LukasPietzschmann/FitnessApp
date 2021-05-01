import logo from '../../image/logo.png';
import profilPic from '../../image/sample-profile.png';


function Header({ className }) {
	return (
		<nav className={` navbar navbar-expand-lg shadow ${className}`}>
			<img className='d-flex rounded-circle nav-link ml-3 mt-3' src={logo} height='85rem' alt='Profile picture' onClick={() => window.location = '/'} />
			<h1 className='ml-3'>Name</h1>
			<img className='d-flex rounded-circle nav-link disabled ml-auto mr-3 mt-3' src={profilPic} height='85rem' alt='Profile picture'/>
		</nav>

	);
}


export default Header;