import React from 'react';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import debounce from 'lodash/debounce';

const InputWrapper = styled.div`
	margin-bottom: 20px;
`;

const Wrapper = styled.div`
	margin-bottom: 24px;
`;

export default class Debt extends React.Component {
	state = {
		name: `Debt ${this.props.debtIndex + 1}`,
		amount: '',
		rate: '',
		repayment: ''
	};

	handleFormUpdated = debounce(() => {
		this.props.handleFormChanged(
			this.props.debtIndex,
			this.state
		);
	}, 300);

	handleChange = name => event => {
		const newValue = event.target.value;

		this.setState({
			[name]: newValue
		}, this.handleFormUpdated);
	};

	componentDidUpdate(prevProps, prevState) {

	}

	render() {
		return (
			<Wrapper>
				<Paper
					className="debt-input-wrapper"
					style={{
						marginRight: 20
					}}
				>
					<Typography variant="h6" component="p">
						{this.state.name}
					</Typography>
					<InputWrapper>
						<TextField
							label="Name"
							InputProps={{
								startAdornment: <InputAdornment />
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
								startAdornment: <InputAdornment />,
								endAdornment: <InputAdornment position="start">%</InputAdornment>
							}}
							onChange={this.handleChange('rate')}
							value={this.state.rate}
						/>
					</InputWrapper>
					<InputWrapper>
						<TextField
							label="Minimum monthly repayment"
							InputProps={{
								startAdornment: <InputAdornment position="end">$</InputAdornment>
							}}
							onChange={this.handleChange('repayment')}
							value={this.state.repayment}
						/>
					</InputWrapper>
				</Paper>
				{this.props.chartData && (
					<div>
						<canvas id={this.state.name} width="400" height="400" />
					</div>
				)}
			</Wrapper>
		);
	}
}