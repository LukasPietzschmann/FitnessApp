import { useEffect, useState } from 'react';

function AccountHeader({ className }) {
	useEffect(() => {
		//fetch Acc. Info
		setAcc({
			name: 'Lukas',
			image: 'https://www.alchinlong.com/wp-content/uploads/2015/09/sample-profile.png'
		});
	});

	const [accInfo, setAcc] = useState(null);

	if (accInfo)
		return (
			<div className={`d-flex justify-content-around ${className}`}>
				<div className='display-3'>Hallo {accInfo.name}!</div>
				<img className='rounded-circle' src={accInfo.image} height='100rem' alt='Profile picture'/>
			</div>
		);
	else
		return '...'
}

export default AccountHeader;