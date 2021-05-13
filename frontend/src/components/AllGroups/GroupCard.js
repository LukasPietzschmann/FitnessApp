import '../ButtonBehavior.css';

function GroupCard({ className, title, target, onClick, img }) {
	return (
		<div className={`card hover-card border border-primary ${className}`} style={{ width: '38vh' }} onClick={target ? () => window.location.href = target : onClick}>
			<img className='card-img-top' src={img} alt={title} style={{ height: '35vh', objectFit: 'cover' }} />
			<div className='card-body' style={{backgroundColor: '#1995d1'}}>
				<h5 className={` text-light text-center ${title}`}>{title}</h5>
			</div>
		</div>
	)
}

export default GroupCard;