import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { IStackData } from '../utils';
import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';
import pink from '@material-ui/core/colors/pink';
import deepOrange from '@material-ui/core/colors/deepOrange';
import { IDebt } from './app/app';

const colours = [red[500], blue[500], green[500], pink[500], deepOrange[500]];

interface IProps {
	months: IStackData[];
	width: number;
	debts: IDebt[];
}

export default class StackedBarChart extends React.Component<IProps> {
	render() {
		return (
			<BarChart
				width={this.props.width - 12}
				height={this.props.width * 0.6}
				data={this.props.months}
				style={{ paddingTop: 24 }}
			>
				<XAxis dataKey="month" />
				<YAxis />
				<Tooltip formatter={value => `$${value}`} />
				<Legend />
				{Object.keys(this.props.months[0].values).map(
					(value, index) => {
						return (
							<Bar
								key={value}
								dataKey={`values.${value}`}
								name={
									this.props.debts.find(
										debt => debt.id === value
									)!.name
								}
								stackId="a"
								fill={colours[index % colours.length]}
							/>
						);
					}
				)}
			</BarChart>
		);
	}
}
