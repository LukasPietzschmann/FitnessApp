/**
 * @author Lukas Pietzschmann
 */

function cleanPercentage(percentage) {
	const tooLow = !Number.isFinite(+percentage) || percentage < 0;
	const tooHigh = percentage > 100;
	return tooLow ? 0 : tooHigh ? 100 : +percentage;
};

function Circle({ colour, pct }) {
	const r = 70;
	const circ = 2 * Math.PI * r;
	const strokePct = ((100 - pct) * circ) / 100;
	return (
		<circle
			r={r}
			cx={100}
			cy={100}
			fill='transparent'
			stroke={strokePct !== circ ? colour : ''}
			strokeWidth={'1.2rem'}
			strokeDasharray={circ}
			strokeDashoffset={pct ? strokePct : 0}
			strokeLinecap='round'
		></circle>
	);
};

function ProgressCircle({ percentage, colour = 'green', text='', className }) {
	const pct = cleanPercentage(percentage);
	return (
		<div className={className}>
			<svg width={200} height={200}>
				<g transform={`rotate(-90 ${'100 100'})`}>
					<Circle colour='lightgrey' />
					<Circle colour={colour} pct={pct} />
				</g>
				<text x="50%" y="50%" dominantBaseline="central" textAnchor="middle">{text}</text>
			</svg>
		</div>
	);
};

export default ProgressCircle;