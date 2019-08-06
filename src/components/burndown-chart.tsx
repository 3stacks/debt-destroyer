import * as React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { IStackData } from '../utils';

interface IProps {
	months: IStackData[];
	width: number;
}

export default class BurndownChart extends React.Component<IProps> {
	render() {
		return (
			<LineChart
				width={this.props.width - 12}
				height={this.props.width * 0.6}
				data={this.props.months}
				style={{ paddingTop: 24 }}
			>
				<XAxis dataKey="month" />
				<YAxis />
				<Tooltip formatter={value => `$${value}`} />
				<Legend />
				<Line dataKey="remainingBalance" />
			</LineChart>
		);
	}
}
