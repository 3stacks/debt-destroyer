import * as React from 'react';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import { IDebt } from './app';
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment';
import TextField from '@material-ui/core/TextField/TextField';
import ButtonBase from '@material-ui/core/ButtonBase';

function debtFactory(): IDebt {
	return {
		name: '',
		amount: '',
		repayment: '',
		rate: ''
	};
}

function editDebt(debt: IDebt, key: keyof IDebt, value: string): IDebt {
	return {
		...debt,
		[key]: value
	};
}

function editRow(
	rows: IDebt[],
	rowIndex: number,
	key: keyof IDebt,
	value: string
) {
	const newValue = [...rows];

	newValue[rowIndex] = editDebt(newValue[rowIndex], key, value);

	return newValue;
}

interface IState {
	rows: IDebt[];
}

export default class DebtTable extends React.Component<any, IState> {
	state = {
		rows: new Array(4).fill(debtFactory()).map(
			(row: IDebt): IDebt => {
				return {
					...row,
					name: 'fuck you',
					amount: '10000',
					rate: '4',
					repayment: '100'
				};
			}
		)
	};

	handleNewRowRequested = () => {
		this.setState(state => {
			return {
				...state,
				rows: [...state.rows, debtFactory()]
			};
		});
	};

	handleChange = (debtProperty: keyof IDebt, debtIndex: number) => (
		event: any
	) => {
		const newValue = event.target.value;

		this.setState(state => {
			return {
				...state,
				rows: editRow(state.rows, debtIndex, debtProperty, newValue)
			};
		});
	};

	render() {
		return (
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Name</TableCell>
						<TableCell>Amount</TableCell>
						<TableCell>Interest rate (%)</TableCell>
						<TableCell>Min. monthly repayment ($)</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{this.state.rows.map(
						({ name, amount, repayment, rate }, index) => {
							const changeHandler = (debtProperty: keyof IDebt) =>
								this.handleChange(debtProperty, index);

							return (
								<TableRow>
									<TableCell>
										<TextField
											label="Name"
											InputProps={{
												startAdornment: (
													<InputAdornment position="start" />
												)
											}}
											onChange={changeHandler('name')}
											value={name}
										/>
									</TableCell>
									<TableCell>
										<TextField
											label="Amount"
											InputProps={{
												startAdornment: (
													<InputAdornment position="end">
														$
													</InputAdornment>
												)
											}}
											onChange={changeHandler('amount')}
											value={amount}
										/>
									</TableCell>
									<TableCell>
										<TextField
											label="Rate"
											InputProps={{
												startAdornment: (
													<InputAdornment position="start" />
												),
												endAdornment: (
													<InputAdornment position="start">
														%
													</InputAdornment>
												)
											}}
											onChange={changeHandler('rate')}
											value={rate}
										/>
									</TableCell>
									<TableCell>
										<TextField
											label="Monthly repayment"
											InputProps={{
												startAdornment: (
													<InputAdornment position="end">
														$
													</InputAdornment>
												)
											}}
											onChange={changeHandler(
												'repayment'
											)}
											value={repayment}
										/>
									</TableCell>
								</TableRow>
							);
						}
					)}
					<TableRow>
						<TableCell colSpan={4}>
							<ButtonBase onClick={this.handleNewRowRequested}>
								+ Add Row
							</ButtonBase>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		);
	}
}
