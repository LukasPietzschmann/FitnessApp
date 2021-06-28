/**
 * @author Vincent Ugrai
 */

import { useState } from 'react';
import { axiosInstance } from '../../constants';

/**
 * This Component displays a single Shopping-Item.
 * @param className The className always gets forwarded to the Top-Level Element of the Component. This enables Styling 'from outside'.
 * @param onClick This function gets executed if the User clicks on the Item.
 * @param children React passes all Child-Elements into this Parameter.
 */
 function ShopSearchCard({ className, onClick, children }) {
	return (
			<div className={`card ${className}`} style={{ width: '18rem' }} onClick={onClick}>
				<div className='bg-white position-relative' style={{zIndex: 100}}>
					{children}
				</div>
			</div>
	);
}

/**
 * This Component provides access to all available Shopping-Items. The User can search for Items and display necessary Information here. This Component is shown under /shop
 * @param className The className always gets forwarded to the Top-Level Element of the Component. This enables Styling 'from outside'.
 */
function ShopSearch({ className }) {
	const [items, setItems] = useState(null);
	const [searchQ, setSearchQ] = useState('');
	const [invalidSearchQ, setInvalidSearchQ] = useState('');

	return (
		<div className={`container ${className}`}>
			<div className='row justify-content-center mt-5'>
				<h2>Search your Product</h2>
			</div>
			<div className='row justify-content-center'>
				<div className='col-7'>
					<div className='input-group mt-3'>
						<input type='search' className='form-control rounded' placeholder='Search' aria-label='Search' aria-describedby='search-addon' value={searchQ} onChange={e => setSearchQ(e.target.value)}/>
						<button type='button' className='btn btn-primary' onClick={() => {
							axiosInstance.get(`shoppingsearch/${searchQ}`)
								.then(({ data }) => {
									if (data.length === 0)
										setInvalidSearchQ(searchQ);
									setItems(data);
								})
								.catch(err => console.error(err));
						}}>Search</button>
					</div>
				</div>
			</div>
			<div className='row justify-content-center mt-5'>
				{items && (items.length > 0 ? items.map(({ name, priceInEuro, href }, i) => { return (
					<ShopSearchCard className='shadow-lg m-3' key={i}>
						<div className='p-4'>
							<h5 className='card-title d-inline'>{name}</h5>
							<div className='card-text d-inline float-right'>{priceInEuro.toFixed(2)}€</div>
						</div>
						<div className='card-footer text-center' onClick={() => window.open(href)} style={{cursor: 'pointer'}}>Go to Amazon</div>
					</ShopSearchCard>
				)}) : <h3 className='text-danger'>Item {invalidSearchQ} not Available</h3>)}
			</div>
		</div>
	);
}

export default ShopSearch;