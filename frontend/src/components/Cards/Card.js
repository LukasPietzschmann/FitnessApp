import './ButtonBehavior.css';

function Card({ className, img = '', onClick, children }) {
	return (
		<div className={`card hover-card ${className}`} style={{ width: '18rem' }} onClick={onClick}>
			<img className='card-img-top position-relative' src={img} alt='Card Pic.' style={{ height: '200px', objectFit: 'cover', zIndex: 1, overflow: 'hidden' }}/>
			<div className='card-body bg-white position-relative' style={{zIndex: 100}}>
				{children}
			</div>
		</div>
	);
}

export default Card;