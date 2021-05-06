import '../ButtonBehavior.css';

function AreaChoiceCard({className, title, target, img}) {
	return (
		<div className={`card ${className}`} onClick={() => window.location = target} style={{width: '25rem'}}>
			<img className='card-img-top' src={img} alt={title} style={{height: '35vh', objectFit: 'cover'}}/>
			<div className='card-body' style={{backgroundColor: '#1995d1'}}>
				<h5 className={` text-light text-center ${title}`}>{title}</h5>
			</div>
		</div>
	);
}

export default AreaChoiceCard;