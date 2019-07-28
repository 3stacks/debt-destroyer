import React from 'react';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import debounce from 'lodash/debounce';
import {ComposedChart, Tooltip, XAxis, YAxis, Bar, Line, Legend} from 'recharts';

const InputWrapper = styled.div`
	margin-bottom: 20px;
`;

const Wrapper = styled.div`
	margin-bottom: 24px;
	display: grid;
	grid-gap: 24px;
	grid-template-columns: 200px auto;
`;

interface IProps {
	debtIndex: number,
	handleFormChanged: (debtIndex : number, newState : IState) => void
}

interface IState {
	name: string,
	amount: string,
	rate: string,
	repayment: string,
	data: any
}

export default class Debt extends React.Component<IProps, IState> {
	state = {
		name: `Debt ${this.props.debtIndex + 1}`,
		amount: '',
		rate: '',
		repayment: '',
		data: [
			{
				"month": "Aug",
				"repayment": 4000,
				"balance": 2400,
			},
			{
				"month": "Aug",
				"repayment": 3000,
				"balance": 1398,
			},
			{
				"month": "Aug",
				"repayment": 2000,
				"balance": 9800,
			},
			{
				"month": "Aug",
				"repayment": 2780,
				"balance": 3908,
			}
		]
	};

	handleFormUpdated = debounce(() => {
		this.props.handleFormChanged(
			this.props.debtIndex,
			this.state
		);
	}, 300);

	handleChange = (name : string) => (event: React.ChangeEvent<any>) => {
		const newValue = event.target.value;

		this.setState({
			[name]: newValue
		} as any, this.handleFormUpdated);
	};

	render() {
		return (
			<Wrapper>
				<Paper className="debt-input-wrapper">
					<Typography variant="h6" component="p">
						{this.state.name}
					</Typography>
					<InputWrapper>
						<TextField
							label="Name"
							InputProps={{
								startAdornment: <InputAdornment position="start" />
							}}
							onChange={this.handleChange('name')}
							value={this.state.name}
						/>
					</InputWrapper>
					<InputWrapper>
						<TextField
							label="Amount"
							InputProps={{
								startAdornment: <InputAdornment position="end">$</InputAdornment>
							}}
							onChange={this.handleChange('amount')}
							value={this.state.amount}
						/>
					</InputWrapper>
					<InputWrapper>
						<TextField
							label="Rate"
							InputProps={{
								startAdornment: <InputAdornment position="start"/>,
								endAdornment: <InputAdornment position="start">%</InputAdornment>
							}}
							onChange={this.handleChange('rate')}
							value={this.state.rate}
						/>
					</InputWrapper>
					<InputWrapper>
						<TextField
							label="Monthly repayment"
							InputProps={{
								startAdornment: <InputAdornment position="end">$</InputAdornment>
							}}
							onChange={this.handleChange('repayment')}
							value={this.state.repayment}
						/>
					</InputWrapper>
				</Paper>
				<ComposedChart width={730} height={250} data={this.state.data}>
					<XAxis dataKey="month" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Bar dataKey="balance" barSize={20} fill="#413ea0" />
					<Line type="monotone" dataKey="repayment" stroke="#ff7300" />
				</ComposedChart>
			</Wrapper>
		);
	}
}
