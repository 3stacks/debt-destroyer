import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import AboutDialog from './about-dialog';
import ButtonBase from '@material-ui/core/ButtonBase';
import HelpIcon from '@material-ui/icons/HelpOutline';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import styled from 'styled-components';
import SnowballDialog from './snowball-dialog';
import DebtTable from './debt-table';
import StackedBarChart from './stacked-bar-chart';
import { calculateDebts, parseChartData } from '../utils';

const Accoutrements = styled.div`
	margin-bottom: 24px;

	fieldset {
		margin-right: 20px;
	}
`;

interface IProps {}

export interface IDebt {
	name: string;
	id: string;
	amount: string;
	rate: string;
	repayment: string;
}

enum APP_STATE_KEYS {
	IS_ABOUT_DIALOG_OPEN = 'isAboutDialogOpen',
	IS_SNOWBALL_DIALOG_OPEN = 'isSnowballDialogOpen',
	DEBTS = 'debts',
	EXTRA_CONTRIBUTIONS = 'extraContributions',
	DEBT_PAYOFF_METHOD = 'debtPayoffMethod'
}

enum DEBT_PAYOFF_METHODS {
	SNOWBALL = 'snowball',
	AVALANCHE = 'avalanche'
}

interface IState {
	[APP_STATE_KEYS.IS_ABOUT_DIALOG_OPEN]: boolean;
	[APP_STATE_KEYS.IS_SNOWBALL_DIALOG_OPEN]: boolean;
	[APP_STATE_KEYS.DEBTS]: IDebt[];
	[APP_STATE_KEYS.EXTRA_CONTRIBUTIONS]: string;
	[APP_STATE_KEYS.DEBT_PAYOFF_METHOD]: DEBT_PAYOFF_METHODS;
}

export default class App extends Component<IProps, IState> {
	wrapper: HTMLDivElement | null = null;

	state = {
		isAboutDialogOpen: false,
		isSnowballDialogOpen: false,
		extraContributions: '0',
		debts: [],
		debtPayoffMethod: DEBT_PAYOFF_METHODS.SNOWBALL
	};

	handleDialogCloseRequested = (
		whichDialog:
			| APP_STATE_KEYS.IS_SNOWBALL_DIALOG_OPEN
			| APP_STATE_KEYS.IS_ABOUT_DIALOG_OPEN
	) => () => {
		this.setState(state => {
			return {
				...state,
				[whichDialog]: false
			};
		});
	};

	handleDialogOpenRequested = (whichDialog: APP_STATE_KEYS) => () => {
		this.setState(state => {
			return {
				...state,
				[whichDialog]: true
			};
		});
	};

	handleChange = (name: string) => (event: React.ChangeEvent<any>) => {
		const newValue = event.target.value;

		this.setState(state => {
			return {
				...state,
				[name]: newValue
			};
		});
	};

	handleDebtChanged = newDebts => {
		this.setState(state => {
			return {
				...state,
				debts: newDebts
			};
		});
	};

	render() {
		return (
			<Typography variant="body1" component="div" className="root">
				<AppBar className="app-bar" position="static">
					<Typography variant="h5" component="h1" color="inherit">
						Debt Destroyer
					</Typography>
					<ButtonBase
						onClick={this.handleDialogOpenRequested(
							APP_STATE_KEYS.IS_ABOUT_DIALOG_OPEN
						)}
					>
						<HelpIcon />
					</ButtonBase>
				</AppBar>
				<div className="max-width-container">
					<Accoutrements ref={el => (this.wrapper = el)}>
						<FormControl component="fieldset">
							<FormLabel component="legend">
								Debt payoff method
							</FormLabel>
							<RadioGroup
								name="debt_payoff_method"
								value={this.state.debtPayoffMethod}
								onChange={this.handleChange(
									APP_STATE_KEYS.DEBT_PAYOFF_METHOD
								)}
							>
								<FormControlLabel
									value="snowball"
									control={<Radio />}
									label="Snowball"
								/>
								<FormControlLabel
									value="avalanche"
									control={<Radio />}
									label="Avalanche"
								/>
								<Button
									color="primary"
									variant="contained"
									onClick={this.handleDialogOpenRequested(
										APP_STATE_KEYS.IS_SNOWBALL_DIALOG_OPEN
									)}
								>
									What is this?
								</Button>
							</RadioGroup>
						</FormControl>
						<TextField
							label="Extra contributions"
							InputProps={{
								startAdornment: (
									<InputAdornment position="end">
										$
									</InputAdornment>
								)
							}}
							onChange={this.handleChange(
								APP_STATE_KEYS.EXTRA_CONTRIBUTIONS
							)}
							value={this.state.extraContributions}
							helperText="How much extra can you afford per month?"
						/>
					</Accoutrements>
					<DebtTable onDebtChanged={this.handleDebtChanged} />
					{this.state.debts.length > 0 && (
						<StackedBarChart
							width={this.wrapper!.getBoundingClientRect().width}
							months={parseChartData(
								calculateDebts({
									debts: this.state.debts,
									debtMethod: this.state.debtPayoffMethod,
									extraContributions: parseInt(
										this.state.extraContributions,
										10
									)
								})
							)}
							debts={this.state.debts}
						/>
					)}
				</div>
				<AboutDialog
					isOpen={this.state.isAboutDialogOpen}
					onCloseRequested={this.handleDialogCloseRequested(
						APP_STATE_KEYS.IS_ABOUT_DIALOG_OPEN
					)}
				/>
				<SnowballDialog
					isOpen={this.state.isSnowballDialogOpen}
					onCloseRequested={this.handleDialogCloseRequested(
						APP_STATE_KEYS.IS_SNOWBALL_DIALOG_OPEN
					)}
				/>
			</Typography>
		);
	}
}
