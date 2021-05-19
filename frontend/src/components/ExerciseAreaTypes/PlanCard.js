import '../Cards/ButtonBehavior.css';

function PlanCard({ className, name, units, id }) {
	return (
		<div className={`card hover-card p-3 ${className}`}>
			<div className='row'>
				<h1 className='col'>{name}</h1>
			</div>
			<div className='row justify-content-start'>
				{units.map(({ name, rep }, i) =>
					<div className='col-auto' key={i}>{name} ({rep} Wiederholung{rep > 1 ? 'en' : ''})</div>)}
			</div>
		</div>
	);
}

export default PlanCard;