import ReactModal from 'react-modal';

import './Modal.css';

function Modal({ className, showModal, showModalHook, children, closeOnClickOutside=true, width='80%' }) {
	return (
		<ReactModal appElement={document.getElementById('root')} closeTimeoutMS={300} isOpen={showModal} onRequestClose={() => closeOnClickOutside && showModalHook(false)} style={{
			overlay: {
				backgroundColor: 'rgba(0, 0, 0, 0.65)',
			},
			content: {
				border: '1px solid #007BFF',
				borderRadius: '5px',
				bottom: 'auto',
				minHeight: '10rem',
				left: '50%',
				padding: '2rem',
				position: 'fixed',
				right: 'auto',
				top: '50%',
				transform: 'translate(-50%,-50%)',
				minWidth: '20rem',
				width: {width},
				maxWidth: '60rem'
			}
		}}>
			<div className={`${className}`}>
				{children}
			</div>
		</ReactModal>
	);
}

export default Modal;