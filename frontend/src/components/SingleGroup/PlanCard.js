function PlanCard({ className, name, units, id }) {
	return (
		<div className={`card ${className}`} onClick={() => {

		}}>
			<div className='card-body'>
				<div className='row'>
					<h1 className='col'>{name}</h1>
				</div>
				<div className='row justify-content-start'>
					{units.map(({ name, rep }, i) =>
						<div className='col-auto' key={i}>{name} ({rep} Wiederholung{rep > 1 ? 'en' : ''})</div>)}
				</div>
			</div>
		</div>
	);
}

export default PlanCard;