/**
 * @author Lukas Pietzschmann
 */

import ReactModal from 'react-modal';

import './Modal.css';

/**
 * A Modal hides all its Children by default. If it' shown, it acts like a Popup, where the Background is dimmed and the Modal is focused.
 * @param className The className always gets forwarded to the Top-Level Element of the Component. This enables Styling 'from outside'.
 * @param showModal if this is true, the modal is shown, otherwise it's hidden.
 * @param showModalHook this function gets called, if the Modal gets dismissed.
 * @param children React passes all Child-Elements into this Parameter.
 * @param closeOnClickOutside if this is true, the Modal can be closed by hitting <esc> or by clicking outside it's content.
 * @param width The Modals width.
 */
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