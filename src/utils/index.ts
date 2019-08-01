import { IDebt } from '../components/app';
import formatDate from 'date-fns/format';
import addMonths from 'date-fns/add_months';

enum DEBT_PAYOFF_METHODS {
	SNOWBALL = 'snowball',
	AVALANCHE = 'avalanche'
}

export interface IStackData {
	month: string;
	values: {
		[debtName: string]: number;
	};
}

interface ICalculateDebtArguments {
	debtMethod: string;
	debts: IDebt[];
	extraContributions: number;
}

interface IParsedDebt {
	id: string;
	name: string;
	amount: number;
	rate: number;
	repayment: number;
}

interface IPaidOffDebt extends IParsedDebt {
	paidOffMonth: number;
	repayment: number;
	repayments: ICalculatedDebts;
	amount: number;
	id: string;
	rate: number;
	interestPaid: number;
	totalPaid: number;
}

interface IRepayments {
	amountLeft: number;
	amountPaid: number;
	interestPaid: number;
}

interface ICalculatedDebts {
	[key: string]: IRepayments;
}

let paidOffDebts: IPaidOffDebt[] = [];
let extraUserContributions = 0;

function getMinPaymentsFromPreviousDebts(month: number) {
	return paidOffDebts.reduce((acc, curr) => {
		if (month >= curr.paidOffMonth) {
			return acc + curr.repayment * 100;
		} else {
			return acc;
		}
	}, 0);
}

export function sortArray(
	array: IParsedDebt[],
	sortFunction: (firstDebt: IParsedDebt, secondDebt: IParsedDebt) => number
) {
	return [...array].sort(sortFunction);
}

export function sortByRate(firstDebt: IParsedDebt, secondDebt: IParsedDebt) {
	return firstDebt.rate - secondDebt.rate;
}

export function sortByAmount(firstDebt: IParsedDebt, secondDebt: IParsedDebt) {
	return firstDebt.amount - secondDebt.amount;
}

function calculateMonthlyInterestRate(interest: number) {
	return interest / 12 / 100;
}

function calculateMinimumMonthlyRepayment(
	interest: number,
	debtAmount: number
) {
	const monthlyInterest = calculateMonthlyInterestRate(interest);

	return monthlyInterest * debtAmount + debtAmount * 0.01;
}

function calculateMonthlyInterest(interest: number, debtAmount: number) {
	return calculateMonthlyInterestRate(interest) * debtAmount * 100;
}

function calculateRepayments(
	debt: number,
	repay: number,
	interest: number,
	month: number = 1,
	valueSoFar: ICalculatedDebts = {},
	extraContributions: number,
	monthToAddExtraContributions: number | null,
	rolloverFromLastDebt: number | null
): ICalculatedDebts {
	if (debt > 0) {
		const adjustedRepayment =
			!monthToAddExtraContributions ||
			month >= monthToAddExtraContributions
				? repay + extraContributions
				: repay;
		const monthlyInterest = calculateMonthlyInterest(interest, debt);
		// This amount may be zero
		const minPaymentsFromPreviousDebts = getMinPaymentsFromPreviousDebts(
			month
		);
		// this is our 'new debt' amount except it doesn't account for the minPayments from other debts
		const debtWithExtraContributions =
			!!rolloverFromLastDebt &&
			month === monthToAddExtraContributions! - 1
				? debt +
				  monthlyInterest -
				  (adjustedRepayment +
						rolloverFromLastDebt * 100 +
						minPaymentsFromPreviousDebts)
				: debt +
				  monthlyInterest -
				  (adjustedRepayment + minPaymentsFromPreviousDebts);
		const parsedRollover =
			!!rolloverFromLastDebt &&
			month === monthToAddExtraContributions! - 1
				? rolloverFromLastDebt * 100
				: 0;

		return calculateRepayments(
			debtWithExtraContributions,
			repay,
			interest,
			month + 1,
			{
				...valueSoFar,
				[month]: {
					amountLeft: debt / 100,
					// If the debt left is less than our regular repayment, just pay what's left
					amountPaid:
						(debt <= adjustedRepayment + parsedRollover
							? debt
							: adjustedRepayment +
							  parsedRollover +
							  minPaymentsFromPreviousDebts) / 100,
					interestPaid: monthlyInterest / 100
				}
			},
			extraContributions,
			monthToAddExtraContributions,
			rolloverFromLastDebt
		);
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

function handleDebtCalculation(
	debt: IParsedDebt,
	prevDebtPaidOffMonth: number | null = null,
	lastMonthLeftOverMoney: number | null = null
) {
	const { id, amount, rate, repayment } = debt;

	const adjustedDebt = debt.amount * 100;
	const adjustedRate = debt.rate / 100;
	const adjustedRepayment = debt.repayment * 100;
	const parsedExtraContributions =
		extraUserContributions > 0 ? extraUserContributions * 100 : 0;
	const repayments = calculateRepayments(
		adjustedDebt,
		adjustedRepayment,
		adjustedRate,
		1,
		{},
		parsedExtraContributions,
		prevDebtPaidOffMonth,
		lastMonthLeftOverMoney
	);
	const lastMonthOfRepayments = Math.max(
		...Object.keys(repayments).map(month => parseInt(month, 10))
	);

	const interestPaid = Object.values(repayments).reduce((acc, curr) => {
		return acc + curr.interestPaid;
	}, 0);

	const calculatedDebt = {
		...debt,
		id,
		amount,
		rate,
		interestPaid,
		repayment,
		repayments,
		totalPaid: interestPaid + debt.amount,
		paidOffMonth: lastMonthOfRepayments
	};

	paidOffDebts.push(calculatedDebt);

	return calculatedDebt;
}

function calculateDebt(debt: IParsedDebt, debtIndex: number) {
	if (debtIndex === 0) {
		return handleDebtCalculation(debt);
	} else {
		const previousDebt = paidOffDebts[paidOffDebts.length - 1];
		const previousDebtBasePayment =
			previousDebt.repayment + extraUserContributions;
		const moneyLeftFromLastMonth =
			previousDebtBasePayment -
			Object.values(previousDebt.repayments)[
				previousDebt.paidOffMonth - 1
			].amountPaid /
				100;
		return handleDebtCalculation(
			debt,
			previousDebt.paidOffMonth,
			moneyLeftFromLastMonth
		);
	}
}

function isDebtValid(debt: IParsedDebt) {
	if (debt.amount <= 0) {
		return false;
	}

	if (debt.rate < 0) {
		return false;
	}

	const minMonthlyRepayment = calculateMinimumMonthlyRepayment(
		debt.rate,
		debt.amount
	);

	return debt.repayment >= minMonthlyRepayment;
}

function parseDebt(debt: IDebt): IParsedDebt {
	return {
		...debt,
		amount: parseFloat(debt.amount),
		rate: parseFloat(debt.rate),
		repayment: parseFloat(debt.repayment)
	};
}

export function calculateDebts({
	debtMethod,
	debts,
	extraContributions
}: ICalculateDebtArguments) {
	extraUserContributions = extraContributions || 0;
	const parsedDebts = debts.map(parseDebt);
	const validDebts = parsedDebts.filter(isDebtValid);

	const sortedDebts =
		debtMethod === DEBT_PAYOFF_METHODS.SNOWBALL
			? sortArray(validDebts, sortByAmount)
			: sortArray(validDebts, sortByRate).reverse();

	return sortedDebts.map(calculateDebt);
}

export function parseChartData(rawChartData: any): IStackData[] {
	const numberOfMonthsUntilDebtsPaidOff = Math.max(
		...rawChartData.map(debt => {
			return Object.keys(debt.repayments).length;
		})
	);

	const months = new Array(numberOfMonthsUntilDebtsPaidOff)
		.fill(true)
		.map((month, index) => {
			const parsedMonth = formatDate(
				addMonths(new Date(), index),
				'MMM YYYY'
			);

			return {
				month: parsedMonth,
				values: {}
			};
		});

	return months.map((month, index) => {
		const debts = rawChartData.reduce((acc, debt) => {
			const monthIndex: string = `${index + 1}` as any;
			// @ts-ignore
			const foundDebtRepayment = debt.repayments[monthIndex];

			if (foundDebtRepayment) {
				return {
					...acc,
					[debt.id]: foundDebtRepayment.amountPaid
				};
			}

			return acc;
		}, {});

		return {
			...month,
			values: debts
		};
	});
}
