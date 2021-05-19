import './ButtonBehavior.css';

function Card({ className, img = '', onClick, children }) {
	return (
		<div className={`card hover-card ${className}`} style={{ width: '18rem' }} onClick={onClick}>
			<img className='card-img-top' src={img} style={{height: '200px', objectFit: 'cover'}}/>
			<div className='card-body'>
				{children}
			</div>
		</div>
	);
}

export default Card;