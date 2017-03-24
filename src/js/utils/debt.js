import moment from 'moment';
import {sortArray, sortByRate, sortByAmount} from './functions';
import {createChart} from './chart';
import isSet from 'is-it-set';

function calculateMonthlyInterestRate(interest) {
	return ((interest / 12) / 100);
}

function calculateMinimumMonthlyRepayment(interest, debtAmount) {
	const monthlyInterest = calculateMonthlyInterestRate(interest);
	return ((monthlyInterest/(1 + monthlyInterest)) * debtAmount);
}

function calculateMonthlyInterest(interest, debt) {
	return ((calculateMonthlyInterestRate(interest) * debt) * 100);
}

function isDebtValid(debt) {
	if (debt.amount === 0) {
		return false;
	}
	if (debt.minPayment === 0) {
		return false;
	}
	if (calculateMinimumMonthlyRepayment(debt.interest, debt.amount) >= debt.minPayment) {
		return false;
	}

	return true;
}

function sanitiseDebts(debts) {
	return debts.map(debt => {
		return {
			...debt,
			amount: !debt.amount ? 0 : parseInt(debt.amount),
			minPayment: !debt.minPayment ? 0 : parseInt(debt.minPayment),
			interest: !debt.interest ? 0 : parseInt(debt.interest)
		}
	})
}

export function calculateDebts(appState) {
	const sanitisedDebts = sanitiseDebts(appState.userData.debts);
	const sortedDebts = appState.viewState.debtMethod === 'snowball'
		? sortArray(sanitisedDebts, sortByAmount)
		: sortArray(sanitisedDebts, sortByRate).reverse();
	const processedDebts = sortedDebts.reduce((acc, debt, index) => {
		if (isDebtValid(debt)) {
			if (index === 0) {
				return [
					...acc,
					handleDebtCalculation(appState.userData, debt)
				];
			} else {
				const previousDebt = acc[acc.length - 1];
				const previousDebtRepayments = previousDebt.repayments;
				const lastMonthIndex = Math.max.apply(null, Object.keys(previousDebtRepayments));
				const previousDebtBasePayment = parseInt(previousDebt.minPayment) + parseInt(appState.userData.extraContributions);
				const moneyLeftFromLastMonth = previousDebtBasePayment - (previousDebtRepayments[lastMonthIndex - 1].amountPaid / 100);
				return [
					...acc,
					handleDebtCalculation(appState.userData, debt, lastMonthIndex, moneyLeftFromLastMonth)
				];
			}
		} else {
			return acc;
		}
	}, []);
	if (processedDebts.length !== 0) {
		const labels = Object.keys(processedDebts[processedDebts.length - 1].repayments).map(month => {
			return moment().add(month, 'months').format('MMM, YYYY');
		});
		appState.userData.processedDebts = processedDebts;
		processedDebts.forEach(processedDebt => {
			const chartReference = appState.viewState.activeCharts.find(chart => chart.id === processedDebt.id);
			if (!!chartReference) {
				const chart = chartReference.chart;
				const debtBreakdown = processedDebt.repayments;
				chart.options.title.text = processedDebt.name;
				chart.data.labels = labels;
				// Update Amount Paid dataset
				chart.data.datasets[0].data = Object.values(debtBreakdown).map(item => parseInt(item.amountPaid) / 100);
				// Update Amount Left dataset
				chart.data.datasets[1].data = Object.values(debtBreakdown).map(item => parseInt(item.amountLeft) / 100);
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
}

function handleDebtCalculation(userData, debt, prevDebtPaidOffMonth, lastMonthLeftOverMoney) {
	const adjustedDebt = parseInt(debt.amount) * 100;
	const adjustedRate = parseInt(debt.interest) / 100;
	const adjustedRepayment = parseInt(debt.minPayment) * 100;
	const parsedExtraContributions = isSet(userData.extraContributions) ? (userData.extraContributions * 100) : 0;
	const repayments = calculateRepayments(adjustedDebt, adjustedRepayment, adjustedRate, 1, {}, parsedExtraContributions, prevDebtPaidOffMonth, lastMonthLeftOverMoney);
	return {
		name: debt.name,
		id: debt.id,
		minPayment: debt.minPayment,
		repayments,
		interestPaid: Object.values(repayments).reduce((acc, curr) => {
			return acc + curr.interestPaid;
		}, 0)
	};
}

function calculateRepayments(debt, repay, interest, month = 1, valueSoFar = {}, extraContributions, monthToAddExtraContributions, rolloverFromLastDebt) {
	if (debt > 0) {
		const adjustedRepayment = parseFloat(month) >= parseFloat(monthToAddExtraContributions) || !monthToAddExtraContributions
			? (repay + extraContributions)
			: repay;
		const monthlyInterest = (((interest / 12) / 100) * debt) * 100;
		const newDebt = !!rolloverFromLastDebt && month === (monthToAddExtraContributions - 1)
			? ((debt + monthlyInterest) - (adjustedRepayment + (rolloverFromLastDebt * 100)))
			: ((debt + monthlyInterest) - adjustedRepayment);
		const parsedRollover = !!rolloverFromLastDebt && month === (monthToAddExtraContributions - 1) ? rolloverFromLastDebt * 100 : 0;
		return calculateRepayments(newDebt, repay, interest, month + 1, {
			...valueSoFar,
			[month]: {
				amountLeft: debt,
				// If the debt left is less than our regular repayment, just pay what's left
				amountPaid: debt <= adjustedRepayment + parsedRollover ? debt : adjustedRepayment + parsedRollover,
				interestPaid: monthlyInterest
			}
		}, extraContributions, monthToAddExtraContributions, rolloverFromLastDebt);
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