import '../ButtonBehavior.css';

function PlanCard({ className, title, target, img }) {
	return (
		<div className={`card  ${className} border border-dark`} onClick={() => window.location = target} style={{height: '38vh', width: '40vh'}}>
			<img className='card-img-top' src={img} alt={title} style={{ height: '30vh', objectFit: 'cover' }} />
			<div className='card-body' style={{backgroundColor: '#1995d1'}}>
				<h5 className={` text-light text-center ${title}`}>{title}</h5>
			</div>
		</div>
	)
}

export default PlanCard;