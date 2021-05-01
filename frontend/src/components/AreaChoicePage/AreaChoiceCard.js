import '../ButtonBehavior.css';

function AreaChoiceCard({className, title, target, img}) {
	return (
		<div className={`card ${className}`} onClick={() => window.location = target} style={{width: '25rem'}}>
			<img className='card-img-top' src={img} alt={title} style={{height: '300px', objectFit: 'cover'}}/>
			<div className='card-body'>
				<h5 className={title}>{title}</h5>
			</div>
		</div>
	);
}

export default AreaChoiceCard;