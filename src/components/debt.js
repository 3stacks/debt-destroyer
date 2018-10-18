import React from 'react';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import Chart from 'chart.js';
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

	canvas = null;

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
		if (this.props.chartData) {
			console.log(this.props.chartData);
			new Chart(this.canvas, {
				type: 'bar',
				data: {
					labels: Object.keys(this.props.chartData.repayments),
					datasets: [
						{
							label: 'Amount Paid',
							type: 'line',
							borderColor: '#ee000',
							backgroundColor: '#ee000',
							fill: false,
							data: Object.values(this.props.chartData.repayments).map(repayment => repayment.amountPaid)
						},
						{
							label: 'Amount Remaining',
							type: 'bar',
							yAxisId: 'amount_left',
							backgroundColor: '#ee000',
							borderColor: '#f0f',
							data: Object.values(this.props.chartData.repayments).map(repayment => repayment.amountLeft)
						}
					]
				},
				options: {
					tooltips: {
						callbacks: {
							label: function(tooltipItems, data) {
								return data.datasets[tooltipItems.datasetIndex].label +': $' + tooltipItems.yLabel;
							}
						}
					},
					title: {
						display: true,
						text: this.state.name,
						position: 'top'
					},
					legend: {
						position: 'bottom'
					},
					scales: {
						yAxes: [
							{
								stacked: false,
								position: 'left',
								id: 'amount_left'
							}
						]
					}
				}
			});
		}
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
				<div>
					<canvas
						ref={el => this.canvas = el}
						id={this.state.name}
						width="400"
						height="400"
					/>
				</div>
			</Wrapper>
		);
	}
}