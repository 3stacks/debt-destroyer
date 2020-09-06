import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Remove';
import { IDebt } from '../app/app';
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment';
import TextField from '@material-ui/core/TextField/TextField';
import Button from '@material-ui/core/Button';
import nanoid from 'nanoid';
import { IClasses, IError } from '../../@types';
import { editRow, validateRow } from '../../utils';
import { errorTemplate } from '../../constants';

function debtFactory(): IDebt {
	return {
		name: '',
		id: nanoid(),
		amount: '',
		repayment: '',
		rate: ''
	};
}

function errorFactory(debtId: string): IError {
	return {
		id: debtId,
		fields: new Map([
			['name', errorTemplate],
			['amount', errorTemplate],
			['repayment', errorTemplate],
			['rate', errorTemplate]
		])
	};
}

interface IProps {
	classes: IClasses;
	onDebtChanged: (rows: IDebt[]) => void;
	initialDebtState: IDebt[];
}

interface IState {
	rows: IDebt[];
	errors: IError[];
}

export default class DebtTable extends React.Component<IProps, IState> {
	state = {
		rows: this.props.initialDebtState,
		errors: this.props.initialDebtState.map(debt => errorFactory(debt.id))
	};

	handleNewRowRequested = () => {
		const newDebt = debtFactory();

		this.setState(state => {
			return {
				...state,
				rows: [...state.rows, newDebt],
				errors: [...state.errors, errorFactory(newDebt.id)]
			};
		});
	};

	componentDidMount() {
		this.dispatchRows();
	}

	dispatchRows = () => {
		this.props.onDebtChanged(this.state.rows);
	};

	handleChange = (debtProperty: keyof IDebt, debtIndex: number) => (
		event: any
	) => {
		const newValue = event.target.value;

		this.setState(state => {
			return {
				...state,
				rows: editRow(state.rows, debtIndex, debtProperty, newValue),
				errors: validateRow(
					state.errors,
					debtIndex,
					state.rows[debtIndex],
					debtProperty,
					newValue
				)
			};
		}, this.dispatchRows);
	};

	handleRowRemoveRequested = (rowId: string) => () => {
		this.setState(state => {
			return {
				...state,
				rows: state.rows.filter(row => {
					return row.id !== rowId;
				})
			};
		}, this.dispatchRows);
	};

	render() {
		const { classes } = this.props;

		return (
			<Paper className={classes.root}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Amount</TableCell>
							<TableCell>Interest rate (%)</TableCell>
							<TableCell>Min. monthly repayment ($)</TableCell>
							<TableCell>Remove row</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{this.state.rows.map(
							({ id, name, amount, repayment, rate }, index) => {
								const errors = this.state.errors[index].fields;
								const changeHandler = (
									debtProperty: keyof IDebt
								) => this.handleChange(debtProperty, index);

								return (
									<TableRow key={id}>
										<TableCell>
											<TextField
												label="Name"
												onChange={changeHandler('name')}
												value={name}
												error={
													errors.get('name')!.error
												}
												helperText={
													errors.get('name')!.message
												}
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
												onChange={changeHandler(
													'amount'
												)}
												value={amount}
												error={
													errors.get('amount')!.error
												}
												helperText={
													errors.get('amount')!
														.message
												}
											/>
										</TableCell>
										<TableCell>
											<TextField
												label="Rate"
												InputProps={{
													endAdornment: (
														<InputAdornment position="start">
															%
														</InputAdornment>
													)
												}}
												onChange={changeHandler('rate')}
												value={rate}
												error={
													errors.get('rate')!.error
												}
												helperText={
													errors.get('rate')!.message
												}
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
												error={
													errors.get('repayment')!
														.error
												}
												helperText={
													errors.get('repayment')!
														.message
												}
											/>
										</TableCell>
										<TableCell>
											<Button
												onClick={this.handleRowRemoveRequested(
													id
												)}
											>
												<DeleteIcon />
											</Button>
										</TableCell>
									</TableRow>
								);
							}
						)}
						<TableRow>
							<TableCell colSpan={5}>
								<Button onClick={this.handleNewRowRequested}>
									<AddIcon /> Add Row
								</Button>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</Paper>
		);
	}
}
