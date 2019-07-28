import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import AboutDialog from './about-dialog';
import ButtonBase from '@material-ui/core/ButtonBase';
import HelpIcon from '@material-ui/icons/HelpOutline';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Fab from '@material-ui/core/Fab';
import styled from 'styled-components';
import Debt from './debt';

const Accoutrements = styled.div`
	margin-bottom: 24px;
	
	fieldset {
		margin-right: 20px;
	}
`;

interface IProps {

}

interface IDebt {
	name: string,
	amount: string,
	rate: string,
	repayment: string,
}

interface IState {
	isAboutDialogOpen: boolean,
	debts: Array<IDebt>,
	extraContributions: string,
	debtPayoffMethod: string
}

export default class App extends Component<IProps, IState> {
	state = {
		isAboutDialogOpen: false,
		debts: [],
		extraContributions: '0',
		debtPayoffMethod: 'snowball'
	};

	handleAboutDialogCloseRequested = () => {
		this.setState({
			isAboutDialogOpen: false
		});
	};

	handleAboutDialogOpenRequested = () =>{
		this.setState({
			isAboutDialogOpen: true
		});
	};

	handleAddDebtButtonPressed = () => {
		this.setState(state => {
			return {
				...state,
				debts: [
					...state.debts,
					{
						name: '',
						amount: '',
						rate: '',
						repayment: ''
					}
				]
			}
		});
	};

	handleDebtFormChanged = (debtIndex : number, values : any) => {
		this.setState(state => {
			return {
				...state,
				debts: state.debts.map((debt : IDebt, index : number) => {
					if (index === debtIndex) {
						return values;
					}

					return debt;
				})
			};
		});
	};

	handleChange = (name : string) => (event : React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.target.value;

		this.setState({
			[name]: newValue
		} as any);
	};

	render() {
		return (
			<Typography
				variant="body1"
				component="div"
				className="root"
			>
				<AppBar
					className="app-bar"
					position="static"
				>
					<Typography variant="h5" component="h1" color="inherit">
						Debt Destroyer
					</Typography>
					<ButtonBase
						onClick={this.handleAboutDialogOpenRequested}
					>
						<HelpIcon />
					</ButtonBase>
				</AppBar>
				<div className="max-width-container">
					<Accoutrements>
						<FormControl component="fieldset">
							<FormLabel
								component="legend"
							>
								Debt payoff method
							</FormLabel>
							<RadioGroup
								name="debt_payoff_method"
								value={this.state.debtPayoffMethod}
								onChange={this.handleChange as any}
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
								<ButtonBase>
									What is this?
								</ButtonBase>
							</RadioGroup>
						</FormControl>
						<TextField
							label="Extra contributions"
							InputProps={{
								startAdornment: <InputAdornment position="end">$</InputAdornment>
							}}
							onChange={this.handleChange('extraContributions')}
							value={this.state.extraContributions}
							helperText="How much extra can you afford per month?"
						/>
					</Accoutrements>
					{this.state.debts.map((debt, index) => {
						return (
							<Debt
								{...debt}
								debtIndex={index}
								handleFormChanged={this.handleDebtFormChanged}
							/>
						);
					})}
				</div>
				<Fab
					color="primary"
					aria-label="Add"
					style={{position: 'fixed', bottom: 10, right: 10}}
					onClick={this.handleAddDebtButtonPressed}
				>
					<AddIcon />
				</Fab>
				<AboutDialog
					isOpen={this.state.isAboutDialogOpen}
					onCloseRequested={this.handleAboutDialogCloseRequested}
				/>
			</Typography>
		);
	}
}
