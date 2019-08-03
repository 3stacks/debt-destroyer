import * as React from 'react';
import {
	calculateDebts,
	DEBT_PAYOFF_METHODS,
	IRepaymentSchedule
} from '../utils';
import formatDate from 'date-fns/format';
import addMonths from 'date-fns/add_months';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import { IDebt } from './app/app';

interface IProps {
	debtData: IRepaymentSchedule;
	debts: IDebt[];
	extraContributions: string;
	debtPayoffMethod: DEBT_PAYOFF_METHODS;
}

interface IState {
	fiftyExtraScenario: IRepaymentSchedule;
	oneHundredFiftyExtraScenario: IRepaymentSchedule;
}

function getTotalInterestPaid(debtData: IRepaymentSchedule): number {
	return debtData.months.reduce((acc, month) => {
		return (
			acc +
			Object.values(month.values).reduce((acc, value) => {
				if (!value.interestPaid) {
					return acc;
				}

				return acc + value.interestPaid;
			}, 0)
		);
	}, 0);
}

function getDebtPayoffDate(debtData: IRepaymentSchedule): string {
	return formatDate(
		addMonths(
			new Date(),
			debtData.months[debtData.months.length - 1].month
		),
		'MMM, YYYY'
	);
}

export default class Insights extends React.Component<IProps, IState> {
	state = {
		fiftyExtraScenario: calculateDebts({
			debtMethod: this.props.debtPayoffMethod,
			extraContributions:
				parseInt(this.props.extraContributions, 10) + 50,
			debts: this.props.debts
		}),
		oneHundredFiftyExtraScenario: calculateDebts({
			debtMethod: this.props.debtPayoffMethod,
			extraContributions:
				parseInt(this.props.extraContributions, 10) + 150,
			debts: this.props.debts
		})
	};

	render() {
		const { debtData } = this.props;
		return (
			<Table>
				<TableHead>
					<TableRow>
						<TableCell />
						<TableCell>Current scenario</TableCell>
						<TableCell>Extra $50 a month</TableCell>
						<TableCell>Extra $150 a month</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					<TableRow>
						<TableCell>Pay off date</TableCell>
						<TableCell>{getDebtPayoffDate(debtData)}</TableCell>
						<TableCell>
							{getDebtPayoffDate(this.state.fiftyExtraScenario)}
						</TableCell>
						<TableCell>
							{getDebtPayoffDate(
								this.state.oneHundredFiftyExtraScenario
							)}
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Total interest paid</TableCell>
						<TableCell>
							${getTotalInterestPaid(debtData).toFixed(2)}
						</TableCell>
						<TableCell>
							$
							{getTotalInterestPaid(
								this.state.fiftyExtraScenario
							).toFixed(2)}
						</TableCell>
						<TableCell>
							$
							{getTotalInterestPaid(
								this.state.oneHundredFiftyExtraScenario
							).toFixed(2)}
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		);
	}
}
