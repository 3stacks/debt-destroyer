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
import { editRow, editDebt } from '../../utils';

function debtFactory(): IDebt {
	return {
		name: '',
		id: nanoid(),
		amount: '',
		repayment: '',
		rate: ''
	};
}

interface IProps {
	classes: IClasses;
	onDebtChanged: (rows: IDebt[]) => void;
}

interface IState {
	rows: IDebt[];
}

export default class DebtTable extends React.Component<IProps, IState> {
	state = {
		rows: [
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
		]
	};

	handleNewRowRequested = () => {
		this.setState(state => {
			return {
				...state,
				rows: [...state.rows, debtFactory()]
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
					rows: editRow(state.rows, debtIndex, debtProperty, newValue)
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
							const changeHandler = (debtProperty: keyof IDebt) =>
								this.handleChange(debtProperty, index);

							return (
								<TableRow key={id}>
									<TableCell>
										<TextField
											label="Name"
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
