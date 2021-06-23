import '../Cards/ButtonBehavior.css';


function ShopSearchCard({ className, onClick, children }) {
	return (
			<div className={`card hover-card ${className}`} style={{ width: '18rem' }} onClick={onClick}>
				<div className='card-title bg-white position-relative' style={{zIndex: 100}}>
					{children}
				</div>
			</div>
	);
}

export default ShopSearchCard;