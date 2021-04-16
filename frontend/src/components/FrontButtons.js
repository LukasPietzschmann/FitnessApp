import './FrontButtons.css';

function FrontButtons({ className }) {
	return (
		<div className='btn-group-vertical float-right mr-5'>
			<button className={`button btn-dark`}>first button</button>
			<button className={`button btn-dark`}>second button</button>
			<button className={`button btn-dark`}>third button</button>
		</div>
	)
}

export default FrontButtons;