/**
 * @author Lukas Pietzschmann
 */

import './ButtonBehavior.css';

/**
 * Cards are used thoughout the UI. To unify their Look and Experience this Component should be always used.
 * @param className The className always gets forwarded to the Top-Level Element of the Component. This enables Styling 'from outside'.
 * @param img The Image shown on top of the Card.
 * @param onClick a function that gets executed if the User clicks on the Card.
 * @param children React passes all Child-Elements into this Parameter.
 */
function Card({ className, img = '', onClick, children }) {
	return (
		<div className={`card hover-card ${className}`} style={{ width: '18rem' }} onClick={onClick}>
			<img className='card-img-top position-relative' src={img} alt='Card Pic.' style={{ height: '200px', objectFit: 'cover', zIndex: 1, overflow: 'hidden' }}/>
			<div className='card-body bg-white position-relative' style={{zIndex: 100}}>
				{children}
			</div>
		</div>
	);
}

export default Card;