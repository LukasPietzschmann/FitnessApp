import { axiosInstance } from '../../constants';
import useUser from '../../hooks/useUser';
import '../Cards/ButtonBehavior.css';

function PlanCard({ className, name, units, id }) {
	const [token, uid, logout] = useUser();

	return (
		<div className={`card ${className}`}>
			<div className='card-body'>
				<div className='row'>
					<h1 className='col'>{name}</h1>
				</div>
				<div className='row justify-content-start'>
					{units.map(({ name, rep }, i) =>
						<div className='col-auto' key={i}>{name} ({rep} Wiederholung{rep > 1 ? 'en' : ''})</div>)}
				</div>
			</div>
			<div className='card-footer btn' onClick={() => {
				axiosInstance.post(`/user/${uid}/plans`, { "pid": id }, { headers: { Token: token } })
					.then(res => window.location.href = '/')
					.catch(err => console.error(err));
			}}>
				Add to Profile
			</div>
		</div>
	);
}

export default PlanCard;