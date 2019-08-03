import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Paper from '@material-ui/core/Paper';
import AboutDialog from '../about-dialog';
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
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SnowballDialog from '../snowball-dialog';
import DebtTable from '../debt-table';
import StackedBarChart from '../stacked-bar-chart';
import {
	calculateDebts,
	IRepaymentSchedule,
	parseChartData
} from '../../utils';
import Insights from '../insights';
import { IClasses } from '../../@types';

interface IProps {
	classes: IClasses;
}

export interface IDebt {
	name: string;
	id: string;
	amount: string;
	rate: string;
	repayment: string;
}

enum DEBT_PAYOFF_METHODS {
	SNOWBALL = 'snowball',
	AVALANCHE = 'avalanche'
}

interface IState {
	isAboutDialogOpen: boolean;
	isSnowballDialogOpen: boolean;
	debts: IDebt[];
	extraContributions: string;
	debtData: IRepaymentSchedule | null;
	whichTab: number;
	debtPayoffMethod: DEBT_PAYOFF_METHODS;
}

export default class App extends Component<IProps, IState> {
	wrapper: HTMLDivElement | null = null;

	state = {
		isAboutDialogOpen: false,
		isSnowballDialogOpen: false,
		extraContributions: '0',
		debts: [],
		debtData: null,
		debtPayoffMethod: DEBT_PAYOFF_METHODS.SNOWBALL,
		whichTab: 0
	};

	handleDialogCloseRequested = (whichDialog: keyof IState) => () => {
		this.setState(state => {
			return {
				...state,
				[whichDialog]: false
			};
		});
	};

	handleDialogOpenRequested = (whichDialog: keyof IState) => () => {
		this.setState(state => {
			return {
				...state,
				[whichDialog]: true
			};
		});
	};

	handleChange = (name: keyof IState) => (event: React.ChangeEvent<any>) => {
		const newValue = event.target.value;

		this.setState(
			state => {
				return {
					...state,
					[name]: newValue
				};
			},
			() => {
				if (
					name === 'debtPayoffMethod' ||
					name === 'extraContributions'
				) {
					this.calculate();
				}
			}
		);
	};

	calculate = debounce(() => {
		const extraContributions = parseInt(this.state.extraContributions, 10);

		if (Number.isNaN(extraContributions) || extraContributions < 0) {
			return;
		}

		this.setState(state => {
			return {
				...state,
				debtData: calculateDebts({
					debts: state.debts,
					debtMethod: state.debtPayoffMethod,
					extraContributions: parseInt(state.extraContributions, 10)
				})
			};
		});
	}, 300);

	handleDebtChanged = newDebts => {
		this.setState(state => {
			return {
				...state,
				debts: newDebts
			};
		}, this.calculate);
	};

	handleTabChanged = (event, newValue) => {
		this.setState(state => {
			return {
				...state,
				whichTab: newValue
			};
		});
	};

	render() {
		const { classes } = this.props;

		return (
			<Typography variant="body1" component="div" className="root">
				<AppBar className="app-bar" position="static">
					<Typography variant="h5" component="h1" color="inherit">
						Debt Destroyer
					</Typography>
					<ButtonBase
						onClick={this.handleDialogOpenRequested(
							'isAboutDialogOpen'
						)}
					>
						<HelpIcon />
					</ButtonBase>
				</AppBar>
				<div className="max-width-container">
					<div
						className={classes.accoutrements}
						ref={el => (this.wrapper = el)}
					>
						<FormControl component="fieldset">
							<FormLabel component="legend">
								Debt payoff method
							</FormLabel>
							<RadioGroup
								name="debt_payoff_method"
								value={this.state.debtPayoffMethod}
								onChange={this.handleChange('debtPayoffMethod')}
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
										'isSnowballDialogOpen'
									)}
								>
									What is this?
								</Button>
							</RadioGroup>
						</FormControl>
						<TextField
							label="Extra contributions"
							{...({ min: '0' } as any)}
							type="number"
							InputProps={{
								startAdornment: (
									<InputAdornment position="end">
										$
									</InputAdornment>
								)
							}}
							onChange={this.handleChange('extraContributions')}
							value={this.state.extraContributions}
							helperText="How much extra can you afford per month?"
						/>
					</div>
					<DebtTable onDebtChanged={this.handleDebtChanged} />
					<Paper>
						<Tabs
							value={this.state.whichTab}
							onChange={this.handleTabChanged}
							textColor="primary"
							indicatorColor="primary"
						>
							<Tab label="Chart" />
							<Tab label="Insights" />
						</Tabs>
						<div hidden={this.state.whichTab !== 0}>
							{this.state.debtData && (
								<StackedBarChart
									width={
										this.wrapper!.getBoundingClientRect()
											.width
									}
									months={parseChartData(this.state.debtData)}
									debts={this.state.debts}
								/>
							)}
						</div>
						<div hidden={this.state.whichTab !== 1}>
							{this.state.debtData && (
								<Insights
									extraContributions={
										this.state.extraContributions
									}
									debtPayoffMethod={
										this.state.debtPayoffMethod
									}
									debtData={this.state.debtData!}
									debts={this.state.debts}
								/>
							)}
						</div>
					</Paper>
				</div>
				<AboutDialog
					isOpen={this.state.isAboutDialogOpen}
					onCloseRequested={this.handleDialogCloseRequested(
						'isAboutDialogOpen'
					)}
				/>
				<SnowballDialog
					isOpen={this.state.isSnowballDialogOpen}
					onCloseRequested={this.handleDialogCloseRequested(
						'isSnowballDialogOpen'
					)}
				/>
			</Typography>
		);
	}
}
