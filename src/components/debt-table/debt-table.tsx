import * as React from 'react';
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
import { IClasses } from '../../@types';
import {
	editRow,
	editDebt,
	calculateMinimumMonthlyRepayment
} from '../../utils';

function debtFactory(): IDebt {
	return {
		name: '',
		id: nanoid(),
		amount: '',
		repayment: '',
		rate: ''
	};
}
const errorTemplate = {
	error: false,
	message: ''
};

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
}

interface IState {
	rows: IDebt[];
	errors: IError[];
}

export interface IError {
	id: string;
	fields: IErrorFields;
}

type IErrorFields = Map<
	keyof IDebt,
	{
		error: boolean;
		message: string;
	}
>;

function validateFields(
	error: IError,
	debt: IDebt,
	debtProperty: keyof IDebt,
	newValue: string
): IErrorFields {
	// we construct a new debt to base validations off
	const newDebt = {
		...debt,
		[debtProperty]: newValue
	};

	if (debtProperty === 'amount' && parseInt(newDebt.amount, 10) <= 0) {
		return error.fields.set('amount', {
			error: true,
			message: 'Amount should be more than 0'
		});
	}

	if (
		debtProperty === 'amount' ||
		debtProperty === 'repayment' ||
		debtProperty === 'rate'
	) {
		const valueAsNumber = parseInt(newDebt[debtProperty], 10);
		const isItNaN = Number.isNaN(valueAsNumber);

		if (isItNaN) {
			return error.fields.set(debtProperty, {
				error: true,
				message: 'Value must be a number'
			});
		}

		const repayment = parseInt(newDebt.repayment, 10);
		const minPayment = calculateMinimumMonthlyRepayment(
			parseInt(newDebt.rate, 10),
			parseInt(newDebt.amount, 10)
		);

		if (repayment < minPayment) {
			return error.fields.set('repayment', {
				error: true,
				message: `Minimum repayment is $${minPayment.toFixed(2)}`
			});
		} else {
			error.fields.set('repayment', errorTemplate);
		}
	}

	return error.fields.set(debtProperty, {
		error: false,
		message: ''
	});
}

function validateRow(
	errors: IError[],
	debtIndex: number,
	debt: IDebt,
	debtProperty: keyof IDebt,
	newValue: string
): IError[] {
	errors[debtIndex] = {
		...errors[debtIndex],
		fields: validateFields(errors[debtIndex], debt, debtProperty, newValue)
	};

	console.log(errors[debtIndex]);

	return errors;
}

const sampleDebts = [
	{
		name: 'AMEX',
		id: nanoid(),
		amount: '10000',
		rate: '16',
		repayment: '450'
	},
	{
		name: 'CBA',
		id: nanoid(),
		amount: '6000',
		rate: '12',
		repayment: '200'
	},
	{
		name: 'Car Loan',
		id: nanoid(),
		amount: '9450',
		rate: '7',
		repayment: '600'
	}
];
const sampleDebtErrors = sampleDebts.map(debt => {
	return errorFactory(debt.id);
});

export default class DebtTable extends React.Component<IProps, IState> {
	state = {
		rows: sampleDebts,
		errors: sampleDebtErrors
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
		this.props.onDebtChanged(this.state.rows);
	}

	handleChange = (debtProperty: keyof IDebt, debtIndex: number) => (
		event: any
	) => {
		const newValue = event.target.value;

		this.setState(
			state => {
				return {
					...state,
					rows: editRow(
						state.rows,
						debtIndex,
						debtProperty,
						newValue
					),
					errors: validateRow(
						state.errors,
						debtIndex,
						state.rows[debtIndex],
						debtProperty,
						newValue
					)
				};
			},
			() => {
				this.props.onDebtChanged(this.state.rows);
			}
		);
	};

	handleRowRemoveRequested = (rowId: string) => () => {
		this.setState(state => {
			return {
				...state,
				rows: state.rows.filter(row => {
					return row.id !== rowId;
				})
			};
		});
	};

	render() {
		const { classes } = this.props;

		return (
			<Table className={classes.root}>
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
							const changeHandler = (debtProperty: keyof IDebt) =>
								this.handleChange(debtProperty, index);

							return (
								<TableRow key={id}>
									<TableCell>
										<TextField
											label="Name"
											onChange={changeHandler('name')}
											value={name}
											error={errors.get('name')!.error}
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
											onChange={changeHandler('amount')}
											value={amount}
											error={errors.get('amount')!.error}
											helperText={
												errors.get('amount')!.message
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
											error={errors.get('rate')!.error}
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
												errors.get('repayment')!.error
											}
											helperText={
												errors.get('repayment')!.message
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
		);
	}
}
