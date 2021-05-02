import Login from "./Login";
import Register from "./Register";

function LoginOrRegister({ className }) {
	return (
		<div className={`d-md-flex h-md-100 align-items-top ${className}`}>
			<Login className='col-md-6 m-2' />
			<div className='border-right'/>
			<Register className='col-md-6 m-2' />
		</div>
	);
}

export default LoginOrRegister;