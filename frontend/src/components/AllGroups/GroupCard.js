import '../ButtonBehavior.css';

function GroupCard({ className, title, target, img }) {
	return (
		<div className={`card ${className}`} onClick={() => window.location.href = target} style={{ width: '38vh' }}>
			<img className='card-img-top' src={img} alt={title} style={{ height: '35vh', objectFit: 'cover' }} />
			<div className='card-body' style={{backgroundColor: '#1995d1'}}>
				<h5 className={` text-light text-center ${title}`}>{title}</h5>
			</div>
		</div>
	)
}

export default GroupCard;