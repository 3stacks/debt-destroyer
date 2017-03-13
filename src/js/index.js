import Chart from 'chart.js';
import moment from 'moment';

const debts = [
	{
		name: 'St George',
		amount: 6000,
		interest: 0,
		minPayment: 120,
		paidOff: false
	},
	{
		name: 'CBA',
		amount: 3000,
		interest: 12,
		minPayment: 200,
		paidOff: false
	},
	{
		name: 'Personal Loan',
		amount: 10000,
		interest: 16,
		minPayment: 524,
		paidOff: false
	}
];

const viewState = {
	extraContributions: 600,
	debtMethod: 'snowball'
};

function handleCreditCardDebtCalculation(debt, prevDebtPaidOffMonth) {
	const adjustedDebt = parseInt(debt.amount) * 100;
	const rate = parseInt(debt.interest) / 100;
	const adjustedRepayment = prevDebtPaidOffMonth ? parseInt(debt.minPayment) * 100 : (parseInt(debt.minPayment) + parseInt(viewState.extraContributions)) * 100;
	const thePayment = calculateRepayments(adjustedDebt, adjustedRepayment, rate, 1, {}, viewState.extraContributions, prevDebtPaidOffMonth);
	const creditChart = createChart(debt.name, thePayment);
	return thePayment;
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
		const adjustedRepayment = month === parseFloat(monthToAddExtraContributions) + 1 ? (repay + (extraContributions * 100)) : repay;
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

function sortArray(array, sortFunction) {
	return [...array].sort(sortFunction);
}

function sortByRate(firstDebt, secondDebt) {
	return firstDebt.interest - secondDebt.interest;
}

function sortByAmount(firstDebt, secondDebt) {
	return firstDebt.amount - secondDebt.amount;
}

const sortedDebts = viewState.debtMethod === 'snowball' ? sortArray(debts, sortByAmount) : sortArray(debts, sortByRate).reverse();
const processedDebts = sortedDebts.reduce((acc, debt, index) => {
	if (index === 0) {
		return [
			...acc,
			handleCreditCardDebtCalculation(debt)
		];
	} else {
		const monthsOfPreviousDebt = Object.keys(acc[acc.length - 1]);
		return [
			...acc,
			handleCreditCardDebtCalculation(debt, monthsOfPreviousDebt[monthsOfPreviousDebt.length - 1])
		];
	}
}, []);