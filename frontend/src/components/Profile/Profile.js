import useCookie from '../../hooks/useCookie';
import Login from './Login';

function Profile({ className }) {
	const [token, deleteToken] = useCookie('Token');

	return (
		<div>
			{
				token ? <button onClick={deleteToken}>Delete Cookie (Token: {token.value})</button> :
				<Login className='mx-5'/>
			}
		</div>
	);
}

export default Profile;