import useCookie from '../../hooks/useCookie';
import LoginOrRegister from './LoginOrRegister';

function Profile({ className }) {
	const [token, deleteToken] = useCookie('Token');

	return (
		<div>
			{
				token ? <button onClick={deleteToken}>Delete Cookie (Token: {token.value})</button> :
				<LoginOrRegister className='mx-5' />
			}
		</div>
	);
}

export default Profile;