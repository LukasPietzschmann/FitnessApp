import { useState } from 'react';
import { axiosInstance } from '../../constants';
import Card from './ShopSearchCard';

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
					<Card className='shadow-lg m-3' key={i}>
						<div className='p-4'>
							<h5 className='card-title d-inline'>{name}</h5>
							<div className='card-text d-inline float-right'>{priceInEuro.toFixed(2)}€</div>
						</div>
						<div className='card-footer text-center' onClick={() => window.open(href)} style={{cursor: 'pointer'}}>Go to Amazon</div>
					</Card>
				)}) : <h3 className='text-danger'>Item {invalidSearchQ} not Available</h3>)}
			</div>
		</div>
	);
}

export default ShopSearch;