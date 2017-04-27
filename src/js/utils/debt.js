import moment from 'moment';
import {sortArray, sortByRate, sortByAmount} from './functions';
import isSet from 'is-it-set';
import {userData} from '../index';

function calculateMonthlyInterestRate(interest) {
	return ((interest / 12) / 100);
}

function calculateMinimumMonthlyRepayment(interest, debtAmount) {
	const monthlyInterest = calculateMonthlyInterestRate(interest);
	return ((monthlyInterest * debtAmount) + (debtAmount * 0.01));
}

function calculateMonthlyInterest(interest, debt) {
	return ((calculateMonthlyInterestRate(interest) * debt) * 100);
}

function isDebtValid(debt) {
	const minMonthlyRepayment = calculateMinimumMonthlyRepayment(debt.interest, debt.amount);
	if (debt.amount <= 0) {
		return {
			error: true,
			target: 'amount',
			message: 'The debt amount must be greater than 0.'
		};
	}

	if (debt.minPayment <= 0) {
		return {
			error: true,
			target: 'minPayment',
			message: 'The minimum payment must be greater than 0.'
		};
	}

	if (minMonthlyRepayment >= debt.minPayment) {
		return {
			error: true,
			target: 'minPayment',
			message: `The monthly payment is less than the recommended minimum payment of $${Math.ceil(minMonthlyRepayment)}`
		};
	}

	return {
		error: false,
		target: null,
		message: null
	};
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

function getDataArrayFromRepayments(whichData, repayments) {
	return Object.values(repayments).map(item => parseInt(item[whichData]) / 100)
}

export function calculateDebt(debt, isFirstDebt) {
	if (isFirstDebt) {
		return handleDebtCalculation(debt);
	} else {
		const previousDebt = userData.paidOffDebts[userData.paidOffDebts.length - 1];
		const previousDebtBasePayment = parseInt(previousDebt.minPayment) + parseInt(userData.extraContributions);
		const moneyLeftFromLastMonth = previousDebtBasePayment - (Object.values(previousDebt.repayments)[previousDebt.paidOffMonth - 1].amountPaid / 100);
		return handleDebtCalculation(debt, previousDebt.paidOffMonth, moneyLeftFromLastMonth);
	}
}

export function calculateDebts(appState) {
	appState.userData.paidOffDebts = [];
	const sanitisedDebts = sanitiseDebts(appState.userData.debts);
	const sortedDebts = appState.viewState.debtMethod === 'snowball'
		? sortArray(sanitisedDebts, sortByAmount)
		: sortArray(sanitisedDebts, sortByRate).reverse();

	const processedDebts = sortedDebts.reduce((acc, debt, index) => {
		const error = isDebtValid(debt);
		if (!error.error) {
			acc.push(calculateDebt(debt, index === 0));
		} else {
			console.log(error);
		}
		return acc;
	}, []);

	console.log(processedDebts);
	appState.userData.debts = processedDebts;

	if (processedDebts.length !== 0) {
		// Generate labels and set the viewState labels to that
		appState.viewState.chartLabels = getChartLabelsFromDebts(appState.userData.debts);
		// Create chart references for each processedDebt
		processedDebts.forEach(processedDebt => {
			if (!processedDebt.error.error) {
				const charts = appState.userData.activeCharts;
				const currentDebtChart = charts.find(chart => processedDebt.id === chart.id);

				if (currentDebtChart) {
					appState.userData.activeCharts = charts.map(chart => {
						if (chart.id === processedDebt.id) {
							return {
								...chart,
								id: processedDebt.id,
								name: processedDebt.name,
								chart: {
									data: {
										amountPaid: getDataArrayFromRepayments('amountPaid', processedDebt.repayments),
										amountRemaining: getDataArrayFromRepayments('amountLeft', processedDebt.repayments)
									}
								}
							}
						} else {
							return chart;
						}
					})
				} else {
					appState.userData.activeCharts.push({
						id: processedDebt.id,
						name: processedDebt.name,
						chart: {
							data: {
								amountPaid: getDataArrayFromRepayments('amountPaid', processedDebt.repayments),
								amountRemaining: getDataArrayFromRepayments('amountLeft', processedDebt.repayments)
							}
						}
					})
				}
			}
		});
	}
}

function getLargestNumberFromArray(array) {
	return Math.max(...array);
}

function getChartLabelsFromDebts(debts) {
	const largestDebt = debts.reduce((acc, curr) => {
		if (acc === undefined) {
			return curr;
		}

		if (!curr.repayments) {
			return acc;
		}

		if (getLargestNumberFromArray(Object.keys(curr.repayments)) > getLargestNumberFromArray(Object.keys(acc.repayments))) {
			return curr;
		}
		return acc;
	}, undefined);

	return Object.keys(largestDebt.repayments).map(month => {
		return moment().add(month, 'months').format('MMM, YYYY');
	});
}

function handleDebtCalculation(debt, prevDebtPaidOffMonth, lastMonthLeftOverMoney) {
	const {name, id, amount, interest, minPayment} = debt;
	const adjustedDebt = parseInt(debt.amount) * 100;
	const adjustedRate = parseInt(debt.interest) / 100;
	const adjustedRepayment = parseInt(debt.minPayment) * 100;
	const parsedExtraContributions = isSet(userData.extraContributions) ? (userData.extraContributions * 100) : 0;
	const repayments = calculateRepayments(userData, adjustedDebt, adjustedRepayment, adjustedRate, 1, {}, parsedExtraContributions, prevDebtPaidOffMonth, lastMonthLeftOverMoney);
	const lastMonthOfRepayments = Math.max(...Object.keys(repayments));

	const interestPaid = Object.values(repayments).reduce((acc, curr) => {
		return acc + curr.interestPaid;
	}, 0);

	userData.paidOffDebts.push({
		name,
		id,
		minPayment,
		repayments,
		paidOffMonth: lastMonthOfRepayments,
	});

	return {
		name,
		id,
		amount,
		interest,
		minPayment,
		repayments,
		interestPaid,
		totalPaid: (interestPaid + (debt.amount * 100)),
		error: {
			target: null,
			message: null
		}
	};
}

function getMinPaymentsFromPreviousDebts(userData, month) {
	return userData.paidOffDebts.reduce((acc, curr) => {
		if (month >= curr.paidOffMonth) {
			return acc + (curr.minPayment * 100);
		} else {
			return acc;
		}
	}, 0);
}

function calculateRepayments(userData, debt, repay, interest, month = 1, valueSoFar = {}, extraContributions, monthToAddExtraContributions, rolloverFromLastDebt) {
	if (debt > 0) {
		const adjustedRepayment = parseFloat(month) >= parseFloat(monthToAddExtraContributions) || !monthToAddExtraContributions
			? (repay + extraContributions)
			: repay;
		const monthlyInterest = calculateMonthlyInterest(interest, debt);
		// This amount may be zero
		const minPaymentsFromPreviousDebts = getMinPaymentsFromPreviousDebts(userData, month);
		// this is our 'new debt' amount except it doesn't account for the minPayments from other debts
		const debtWithExtraContributions = !!rolloverFromLastDebt && month === (monthToAddExtraContributions - 1)
			? ((debt + monthlyInterest) - (adjustedRepayment + (rolloverFromLastDebt * 100) + minPaymentsFromPreviousDebts))
			: ((debt + monthlyInterest) - (adjustedRepayment + minPaymentsFromPreviousDebts));
		const parsedRollover = !!rolloverFromLastDebt && month === (monthToAddExtraContributions - 1) ? rolloverFromLastDebt * 100 : 0;
		return calculateRepayments(userData, debtWithExtraContributions, repay, interest, month + 1, {
			...valueSoFar,
			[month]: {
				amountLeft: debt,
				// If the debt left is less than our regular repayment, just pay what's left
				amountPaid: debt <= (adjustedRepayment + parsedRollover) ? debt : (adjustedRepayment + parsedRollover + minPaymentsFromPreviousDebts),
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

function getDefaultLabels(monthsToAdd, valueSoFar = [], index = 0) {
	if (index <= (monthsToAdd - 1)) {
		return getDefaultLabels(monthsToAdd, [
			...valueSoFar,
			moment().add(index, 'months').format('MMM, YYYY')
		], index + 1)
	} else {
		return valueSoFar;
	}
}