import Chart from 'chart.js';
import moment from 'moment';
import Vue from 'vue';
import addDebtForm from './components/add-debt-form';
import userDebts from './components/user-debts';
import {sortArray, sortByRate, sortByAmount } from './utils';

const userData = {
	debts: [
		{
			id: 1,
			name: 'St George',
			amount: 5700,
			interest: 0,
			minPayment: 120,
			paidOff: false
		},
		{
			id: 2,
			name: 'CBA',
			amount: 2400,
			interest: 12,
			minPayment: 200,
			paidOff: false
		},
		{
			id: 3,
			name: 'Personal Loan',
			amount: 9500,
			interest: 16,
			minPayment: 524,
			paidOff: false
		}
	],
	extraContributions: 4055,
};

const viewState = {
	debtMethod: 'avalanche',
	editMode: true,
	addDebtMode: false
};

function handleCreditCardDebtCalculation(debt, prevDebtPaidOffMonth) {
	const adjustedDebt = parseInt(debt.amount) * 100;
	const rate = parseInt(debt.interest) / 100;
	const adjustedRepayment = prevDebtPaidOffMonth ? parseInt(debt.minPayment) * 100 : (parseInt(debt.minPayment) + parseInt(userData.extraContributions)) * 100;
	const repayments = calculateRepayments(adjustedDebt, adjustedRepayment, rate, 1, {}, userData.extraContributions, prevDebtPaidOffMonth);
	const interestPaid = Object.values(repayments).reduce((acc, curr) => {
		return acc + curr.interestPaid;
	}, 0);
	return {
		name: debt.name,
		repayments,
		interestPaid,
		totalPaid: (debt.amount * 100) + interestPaid
	};
}

function createChart(chartId, paymentGraph) {
	const canvas = document.createElement('canvas');
	const id = chartId;
	canvas.id = id;
	document.getElementById('chart_container').appendChild(canvas);
	return new Chart(id, {
		type: 'bar',
		data: {
			labels: Object.keys(paymentGraph).map(month => {
				return moment().add(month, 'months').format('MMM, YYYY');
			}),
			datasets: [
				{
					label: 'Amount Paid',
					type: 'line',
					yAxisId: 'amount_paid',
					borderColor: '#e74c3c',
					backgroundColor: '#e74c3c',
					fill: false,
					data: Object.values(paymentGraph).map(function(item) {
						return parseInt(item.amountPaid) / 100;
					})
				},
				{
					label: 'Amount Remaining',
					type: 'bar',
					yAxisId: 'amount_left',
					backgroundColor: '#3498db',
					borderColor: '#3498db',
					data: Object.values(paymentGraph).map(function(item) {
						return parseInt(item.amountLeft) / 100;
					})
				}
			],
			borderWidth: 1
		},
		options: {
			scales: {
				yAxes: [
					{
						stacked: false,
						position: 'left',
						id: 'amount_left'
					},
					{
						stacked: false,
						position: 'right',
						id: 'amount_paid'
					}
				]
			}
		}
	});
}

function calculateRepayments(debt, repay, interest, month = 1, valueSoFar = {}, extraContributions, monthToAddExtraContributions) {
	if (debt > 0) {
		const adjustedRepayment = month === parseFloat(monthToAddExtraContributions) ? (repay + (extraContributions * 100)) : repay;
		const monthlyInterest = (((interest / 12) / 100) * debt) * 100;
		const newDebt = ((debt + monthlyInterest) - adjustedRepayment);
		return calculateRepayments(newDebt, adjustedRepayment, interest, month + 1, {
				...valueSoFar,
				[month]: {
					amountLeft: debt,
					// If the debt left is less than our regular repayment, just pay what's left
					amountPaid: debt <= adjustedRepayment ? debt : adjustedRepayment,
					interestPaid: monthlyInterest
				}
		}, extraContributions, monthToAddExtraContributions);
	} else {
		return {
			...valueSoFar,
			[month]: {
				amountLeft: 0,
				amountPaid: 0,
				interestPaid: 0
			}
		};
	}
}

const sortedDebts = viewState.debtMethod === 'snowball' ? sortArray(userData.debts, sortByAmount) : sortArray(userData.debts, sortByRate).reverse();
const processedDebts = sortedDebts.reduce((acc, debt, index) => {
	if (index === 0) {
		return [
			...acc,
			handleCreditCardDebtCalculation(debt)
		];
	} else {
		const monthsOfPreviousDebt = Object.keys(acc[acc.length - 1].repayments);
		return [
			...acc,
			handleCreditCardDebtCalculation(debt, monthsOfPreviousDebt[monthsOfPreviousDebt.length - 1])
		];
	}
}, []);

processedDebts.forEach(processedDebt => {
	createChart(processedDebt.name, processedDebt.repayments);
});

const pageView = new Vue({
	el: '#root',
	methods: {
		handleDebtValueChanged(debtId, valueToChange, newValue) {
			console.log(newValue);
			userData.debts = userData.debts.map(debt => {
				if (debt.id === debtId) {
					console.log('hello');
					return {
						...debt,
						[valueToChange]: newValue
					}
				} else {
					return debt;
				}
			});
			console.log(userData.debts);
			// this.$set('userData', 'debts', userData.debts);
		handleDebtMethodChanged(changeEvent) {
			viewState.debtMethod = changeEvent.target.value;
			return calculateDebts();
		}
	},
	data: {
		viewState,
		userData
	},
	components: {
		'add-debt-form': addDebtForm,
		'user-debts': userDebts
	}
});

window.zz = pageView;