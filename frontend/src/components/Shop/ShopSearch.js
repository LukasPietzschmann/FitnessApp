import { useState } from 'react';
import { axiosInstance } from '../../constants';
import Card from './ShopSearchCard';

function ShopSearch({ className }) {
	const [items, setItems] = useState(null);
	const [searchQ, setSearchQ] = useState('');

	return (
		<div>
			<div className='row justify-content-center mt-5'>
				<h2>Search your Product</h2>
			</div>
			<div className='row justify-content-center'>
				<div className='col-7'>
					<div className='input-group mt-3'>
						<input type='search' className='form-control rounded' placeholder='Search' aria-label='Search' aria-describedby='search-addon' value={searchQ} onChange={e => setSearchQ(e.target.value)}/>
						<button type='button' className='btn btn-primary' onClick={() => {
							axiosInstance.get(`shoppingsearch/${searchQ}`)
								.then(({ data }) => setItems(data))
								.catch(err => console.error(err));
						}}>Search</button>
					</div>
				</div>
			</div>
			<div className='row justify-content-center mt-5'>
				<div className='col-auto'>
					{items && (items.length > 0 ? items.map(({ name, priceInEuro, href }, i) => { return (
						<Card className='shadow-lg m-3' key={i}>
							<div className='row mt-3 justify-content-center'>
								<div className='col ml-3 align-self-start'>
									<h5 className='card-title'>{name}</h5>
									<a className='card-text' href={href}>Test</a>
								</div>
								<div className='col-auto mr-3 align-self-center'>
									<p className='card-text'>{priceInEuro}</p>
								</div>
							</div>

						</Card>
					)}) : <h3>Item not Available</h3>)}
				</div>
			</div>
		</div>
	);
}

export default ShopSearch;