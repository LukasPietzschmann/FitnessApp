import './FrontPage.css';


function FrontPage({ className }) {
	return (
		<div className={`backgroundImage btn-group-vertical ${className}`}>
			<h1 className='mt-5'>Titel</h1>
			<button className='frontEndBtn btn-dark' onClick={() => window.location='/test'}>first button</button>
			<button className='frontEndBtn btn-dark' onClick={() => window.location='/test'}>second button</button>
			<button className='frontEndBtn btn-dark' onClick={() => window.location = '/test'}>third button</button>
		</div>
	);
}

export default FrontPage;