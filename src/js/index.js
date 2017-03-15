import moment from 'moment';
import Vue from 'vue';
import addDebtForm from './components/add-debt-form';
import userDebts from './components/user-debts';
import {sortArray, sortByRate, sortByAmount } from './utils';
import {createChart} from './utils/chart'

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
	addDebtMode: false,
	activeCharts: []
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

function calculateDebts() {
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
	const labels = Object.keys(processedDebts[processedDebts.length - 1].repayments).map(month => {
		return moment().add(month, 'months').format('MMM, YYYY');
	});
	processedDebts.forEach(processedDebt => {
		const chartReference = viewState.activeCharts.find(chart => chart.name === processedDebt.name);
		if (!!chartReference) {
			const chart = chartReference.chart;
			const debtBreakdown = processedDebt.repayments;
			chart.data.labels = labels;
			// Update Amount Paid dataset
			chart.data.datasets[0].data = Object.values(debtBreakdown).map(function(item) {
				return parseInt(item.amountPaid) / 100;
			});
			// Update Amount Left dataset
			chart.data.datasets[1].data = Object.values(debtBreakdown).map(function(item) {
				return parseInt(item.amountLeft) / 100;
			});
			chart.update();
		} else {
			viewState.activeCharts = [
				...viewState.activeCharts,
				{
					name: processedDebt.name,
					chart: createChart(processedDebt.name, processedDebt.repayments, labels)
				}
			];
		}
	});
}

const pageView = new Vue({
	el: '#root',
	methods: {
		handleDebtValueChanged(debtId, valueToChange, newValue) {
			userData.debts = userData.debts.map(debt => {
				if (debt.id === debtId) {
					return {
						...debt,
						[valueToChange]: newValue
					}
				} else {
					return debt;
				}
			});
			if (valueToChange !== 'name') {
				return calculateDebts();
			}
		},
		handleExtraContributionsChanged(changeEvent) {
			userData.extraContributions = changeEvent.target.value;
			return calculateDebts();
		},
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