import Chart from 'chart.js';

const debts = [
	{
		name: 'St George',
		amount: 6000,
		interest: 0,
		minPayment: 120
	},
	{
		name: 'CBA',
		amount: 3000,
		interest: 12,
		minPayment: 200
	},
	{
		name: 'Personal Loan',
		amount: 10000,
		interest: 16,
		minPayment: 524
	}
];

const viewState = {
	extraContributions: 1100,
	debtMethod: 'avalanche'
};

function handleCreditCardDebtCalculation(debtName, debtAmount, debtInterest, repayment) {
	const debt = parseInt(debtAmount) * 100;
	const rate = parseInt(debtInterest) / 100;
	const adjustedRepayment = parseInt(repayment) * 100;
	const thePayment = calculateRepayments(debt, adjustedRepayment, rate);
	const creditChart = createChart(debtName, thePayment);
	console.log(thePayment);
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
			labels: Object.keys(paymentGraph),
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

function calculateRepayments(debt, repay, interest, month = 1, valueSoFar = {}) {
	if (debt > 0) {
		const monthlyInterest = (((interest / 12) / 100) * debt) * 100;
		const newDebt = ((debt + monthlyInterest) - repay);
		return calculateRepayments(newDebt, repay, interest, month + 1,
			{
				...valueSoFar,
			[month]: {
			amountLeft: debt,
				// If the debt left is less than our regular repayment, just pay what's left
				amountPaid: debt <= repay ? debt : repay
		}
	});
	} else {
		return {
			...valueSoFar,
			[month]: {
			amountLeft: 0,
				amountPaid: 0
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

if (viewState.debtMethod === 'snowball') {
	const snowballDebts = sortArray(debts, sortByAmount);
	snowballDebts.forEach(debt => {
		const repayment = handleCreditCardDebtCalculation(debt.name, debt.amount, debt.interest, debt.minPayment);
		console.log(repayment);
});
} else {
	const avalancheDebts = sortArray(debts, sortByRate).reverse();
	avalancheDebts.forEach((debt, index) => {
		handleCreditCardDebtCalculation(debt.name, debt.amount, debt.interest, index === 0 ? debt.minPayment + viewState.extraContributions : debt.minPayment);
});
}