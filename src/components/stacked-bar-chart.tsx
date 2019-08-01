import * as React from 'react';
import {
	BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import chartData from '../data/sample-chart-data';
import formatDate from 'date-fns/format';
import addMonths from 'date-fns/add_months';

interface IStackData {
	month: string,
	values: {
		[debtName : string]: number
	}
}

export function parseChartData(rawChartData : any) : IStackData[] {
	const a =  [
		{
			month: 'Aug 2019',
			values: {
				'some-debt': 1000,
				'another-one': 1200,
				'another-two': 1200
			}
		},
		{
			month: 'Sep 2019',
			values: {
				'some-debt': 400,
				'another-one': 2900,
				'another-two': 6200
			}
		}
	]

	const numberOfMonthsUntilDebtsPaidOff = Math.max(...chartData.map(debt => {
		return Object.keys(debt.repayments).length;
	}));

	const months = new Array(numberOfMonthsUntilDebtsPaidOff).fill(true).map((month, index) => {
		const parsedMonth = addMonths(new Date(), index);

		return {
			month: `${index + 1}`,
			values: {}
		}
	});

	return months.map((month, index) => {
		const debts = chartData.reduce((acc, debt) => {
			const monthIndex : string = `${index + 1}` as any;
			// @ts-ignore
			const foundDebtRepayment = debt.repayments[monthIndex];

			if (foundDebtRepayment) {
				return {
					...acc,
					[debt.id]: foundDebtRepayment.amountPaid
				};
			}

			return acc;
		}, {});

		return {
			...month,
			values: debts
		};
	});
}

interface IProps {
	months: IStackData[]
}

function getRandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

export default class StackedBarChart extends React.Component<IProps> {
	render() {
		return (
			<BarChart width={500} height={300} data={this.props.months}>
				<XAxis dataKey="month" />
				<YAxis />
				<Tooltip />
				<Legend />
				{Object.keys(this.props.months[0].values).map(value => {
					return (
						<Bar dataKey={`values.${value}`} stackId="a" fill={getRandomColor()} />
					);
				})}
			</BarChart>
		);
	}
}
