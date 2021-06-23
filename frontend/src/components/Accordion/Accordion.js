/**
 * @author Lukas Pietzschmann
 */

import React, { useState, useRef, useEffect } from 'react';

import Arrow from './Arrow';
import './Accordion.css';

function Accordion({ className, title, children, condition=true, conditionWarning }) {
	const [isActive, setActive] = useState(false);
	const [desiredHeight, setDesiredHeight] = useState('0px');
	const [rotated, setRotated] = useState('accordion_icon');

	const contentRef = useRef(null);

	function toggleAccordion() {
		if (!condition)
			return;
		setActive(!isActive);
		setRotated(isActive ? 'accordion_icon' : 'accordion_icon rotate');
	}

	useEffect(() => {
		if (!condition)
			setActive(false);
		setDesiredHeight(isActive ? `${contentRef.current.scrollHeight}px` : '0px');
	}, [condition, isActive])

	return (
		<div className={`${className}`}>
			<h6 role='button' className={`${isActive ? 'shadow' : ''} bg-white rounded card-header accordion`} onClick={toggleAccordion} >
				{title}
				<Arrow className={`${rotated}`} />
				<div className='text-danger text-uppercase font-weight-light'>
					<small>{condition ? '' : conditionWarning}</small>
				</div>
			</h6>
			<div ref={contentRef} style={{ maxHeight: `${desiredHeight}` }} className='accordion_content'>
				<div className='py-3 px-4'>
					{children}
				</div>
			</div>
		</div>
	);
}

export default Accordion;
