import moment from 'moment';
import {sortArray, sortByRate, sortByAmount } from './functions';
import {createChart} from './chart'

function handleCreditCardDebtCalculation(userData, debt, prevDebtPaidOffMonth) {
	const adjustedDebt = parseInt(debt.amount) * 100;
	const rate = parseInt(debt.interest) / 100;
	const adjustedRepayment = prevDebtPaidOffMonth ? parseInt(debt.minPayment) * 100 : ((parseInt(debt.minPayment) * 100) + (parseInt(userData.extraContributions) * 100));
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

export function calculateDebts(appState) {
	const sortedDebts = appState.viewState.debtMethod === 'snowball' ? sortArray(appState.userData.debts, sortByAmount) : sortArray(appState.userData.debts, sortByRate).reverse();
	const processedDebts = sortedDebts.reduce((acc, debt, index) => {
		if (index === 0) {
			return [
				...acc,
				handleCreditCardDebtCalculation(appState.userData, debt)
			];
		} else {
			const previousDebtRepayments = acc[acc.length - 1].repayments;
			const monthsOfPreviousDebt = Object.keys(previousDebtRepayments);
			const lastMonth = Math.max.apply(null, monthsOfPreviousDebt);
			return [
				...acc,
				handleCreditCardDebtCalculation(appState.userData, debt, lastMonth)
			];
		}
	}, []);
	const labels = Object.keys(processedDebts[processedDebts.length - 1].repayments).map(month => {
		return moment().add(month, 'months').format('MMM, YYYY');
	});
	appState.userData.processedDebts = processedDebts;
	processedDebts.forEach(processedDebt => {
		const chartReference = appState.viewState.activeCharts.find(chart => chart.name === processedDebt.name);
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
			appState.viewState.activeCharts = [
				...appState.viewState.activeCharts,
				{
					name: processedDebt.name,
					chart: createChart(processedDebt.name, processedDebt.repayments, labels)
				}
			];
		}
	});
}