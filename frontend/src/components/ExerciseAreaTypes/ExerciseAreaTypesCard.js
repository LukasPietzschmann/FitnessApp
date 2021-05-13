import '../ButtonBehavior.css';

function ExerciseAreaTypesCard({className, title, target}) {
	return (
		<div className={`card hover-card border-dark ${className}`} onClick={() => window.location = target} style={{width: '80rem'}}>
			<div className='card-title'>
				<h1 className='title text-center mt-3'>{title}</h1>
			</div>
		</div>
	);
}

export default ExerciseAreaTypesCard;