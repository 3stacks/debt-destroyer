import React, { Component } from 'react';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Paper from '@material-ui/core/Paper';
import AboutDialog from '../about-dialog';
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
import { stringify, parse } from 'query-string';
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
	isViewReady: boolean;
	isAboutDialogOpen: boolean;
	isSnowballDialogOpen: boolean;
	debts: IDebt[];
	extraContributions: string;
	debtData: IRepaymentSchedule | null;
	whichTab: number;
	debtPayoffMethod: DEBT_PAYOFF_METHODS;
	wrapperWidth: number;
}

function parseQueryStringParameter(
	parameter: string | string[] | null | undefined,
	defaultValue?: string
): string {
	if (!parameter && defaultValue) {
		return defaultValue;
	}

	if (Array.isArray(parameter)) {
		return parameter[0];
	}

	if (typeof parameter === 'string') {
		return parameter;
	}

	return '';
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
		whichTab: 0,
		wrapperWidth: 0,
		isViewReady: false
	};

	backupState = () => {
		const { extraContributions, debts, debtPayoffMethod } = this.state;
		const query = stringify({
			extraContributions,
			debts: JSON.stringify(debts),
			debtPayoffMethod
		});

		window.history.pushState({}, '', `/?${query}`);
	};

	restoreState = () => {
		const location = window.location;
		const queryParams = parse(location.search);

		this.setState(state => {
			const debts = parseQueryStringParameter(queryParams.debts);
			const payoffMethod = parseQueryStringParameter(
				queryParams.debtPayoffMethod as DEBT_PAYOFF_METHODS,
				DEBT_PAYOFF_METHODS.SNOWBALL
			);

			return {
				...state,
				isViewReady: true,
				debts: JSON.parse(debts),
				extraContributions: parseQueryStringParameter(
					queryParams.extraContributions,
					'0'
				),
				debtPayoffMethod:
					payoffMethod !== DEBT_PAYOFF_METHODS.SNOWBALL &&
					payoffMethod !== DEBT_PAYOFF_METHODS.AVALANCHE
						? DEBT_PAYOFF_METHODS.SNOWBALL
						: payoffMethod
			};
		}, this.handleResize);
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

		this.backupState();

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

	handleResize = () => {
		this.setState({
			wrapperWidth: this.wrapper
				? this.wrapper.getBoundingClientRect().width
				: 0
		});
	};

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

	componentDidMount() {
		this.handleResize();
		this.restoreState();
		window.addEventListener('resize', throttle(this.handleResize, 300));
	}

	render() {
		const { classes } = this.props;

		if (!this.state.isViewReady) {
			return null;
		}

		return (
			<Typography variant="body1" component="div" className="root">
				<AppBar className={classes.appBar} position="static">
					<div className={classes.aboutButton} />
					<Typography variant="h5" component="h1" color="inherit">
						Debt Destroyer
					</Typography>
					<Button
						className={classes.aboutButton}
						onClick={this.handleDialogOpenRequested(
							'isAboutDialogOpen'
						)}
					>
						<HelpIcon />
					</Button>
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
					<DebtTable
						initialDebtState={this.state.debts}
						onDebtChanged={this.handleDebtChanged}
					/>
					<Paper className={classes.tabWrapper}>
						<Tabs
							value={this.state.whichTab}
							onChange={this.handleTabChanged}
							textColor="primary"
							indicatorColor="primary"
						>
							<Tab label="Chart" />
							<Tab label="Insights" />
						</Tabs>
						{this.state.debtData && (
							<React.Fragment>
								<div hidden={this.state.whichTab !== 0}>
									{this.state.whichTab === 0 && (
										<StackedBarChart
											width={this.state.wrapperWidth}
											months={
												this.state.debtData === null
													? []
													: parseChartData(
															this.state.debtData!
													  )
											}
											debts={this.state.debts}
										/>
									)}
								</div>
								<div hidden={this.state.whichTab !== 1}>
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
								</div>
							</React.Fragment>
						)}
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
