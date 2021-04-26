import '../ButtonBehavior.css';

function FrontPageCard({ className, title, desc, img, target }) {
	return (
		<div className={`card ${className}`} style={{ width: '18rem' }} onClick={() => window.location = target}>
			<img className='card-img-top' src={img} alt={title} style={{height: '200px', objectFit: 'cover'}}/>
			<div className='card-body'>
				<h5 className='card-title'>{title}</h5>
				<p className='card-text'>{desc}</p>
			</div>
		</div>
	);
}

export default FrontPageCard;