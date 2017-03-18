import moment from 'moment';
import {sortArray, sortByRate, sortByAmount } from './functions';
import {createChart} from './chart';
import isSet from 'is-it-set';

function handleDebtCalculation(userData, debt, prevDebtPaidOffMonth, lastMonthLeftOverMoney) {
	const adjustedDebt = parseInt(debt.amount) * 100;
	const adjustedRate = parseInt(debt.interest) / 100;
	const adjustedRepayment = parseInt(debt.minPayment) * 100;
	const parsedExtraContributions = isSet(userData.extraContributions) ? (userData.extraContributions * 100) : 0;
	const repayments = calculateRepayments(adjustedDebt, adjustedRepayment, adjustedRate, 1, {}, parsedExtraContributions, prevDebtPaidOffMonth, lastMonthLeftOverMoney);
	const interestPaid = Object.values(repayments).reduce((acc, curr) => {
		return acc + curr.interestPaid;
	}, 0);
	return {
		name: debt.name,
		id: debt.id,
		minPayment: debt.minPayment,
		repayments,
		interestPaid,
		totalPaid: (debt.amount * 100) + interestPaid
	};
}

// TODO: STOP MAKING CALCULATING THE REPAYMENT AMOUNTS THE RESPONSIBILITY OF THIS FUNCTION, DO IT IN handleDebtCalculation
function calculateRepayments(debt, repay, interest, month = 1, valueSoFar = {}, extraContributions, monthToAddExtraContributions, firstMonthBoost) {
	if (debt > 0) {
		const adjustedRepayment = month >= parseFloat(monthToAddExtraContributions) || !monthToAddExtraContributions
			? (repay + extraContributions)
			: repay;
		const monthlyInterest = (((interest / 12) / 100) * debt) * 100;
		const newDebt = !!firstMonthBoost
			? ((debt + monthlyInterest) - (adjustedRepayment + (firstMonthBoost * 100)))
			: ((debt + monthlyInterest) - adjustedRepayment);
		return calculateRepayments(newDebt, repay, interest, month + 1, {
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
				handleDebtCalculation(appState.userData, debt)
			];
		} else {
			const previousDebt = acc[acc.length - 1];
			const previousDebtRepayments = previousDebt.repayments;
			const monthsOfPreviousDebt = Object.keys(previousDebtRepayments);
			const lastMonth = Math.max.apply(null, monthsOfPreviousDebt);
			const previousDebtBasePayment = previousDebt.minPayment + appState.userData.extraContributions;
			const moneyLeftFromLastMonth = previousDebtBasePayment - (previousDebtRepayments[lastMonth - 1].amountPaid / 100);
			return [
				...acc,
				handleDebtCalculation(appState.userData, debt, lastMonth, moneyLeftFromLastMonth)
			];
		}
	}, []);
	const labels = Object.keys(processedDebts[processedDebts.length - 1].repayments).map(month => {
		return moment().add(month, 'months').format('MMM, YYYY');
	});
	appState.userData.processedDebts = processedDebts;
	processedDebts.forEach(processedDebt => {
		const chartReference = appState.viewState.activeCharts.find(chart => chart.id === processedDebt.id);
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
					id: processedDebt.id,
					chart: createChart({id: processedDebt.id, name: processedDebt.name}, processedDebt.repayments, labels)
				}
			];
		}
	});
}