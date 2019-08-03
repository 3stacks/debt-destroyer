import { IDebt } from '../components/app';
import addMonths from 'date-fns/add_months';
import formatDate from 'date-fns/format';

export enum DEBT_PAYOFF_METHODS {
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

interface IRepayments {
	amountLeft: number;
	amountPaid: number;
	interestPaid: number;
}

interface ICalculatedDebts {
	[key: string]: IRepayments;
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
): number {
	const monthlyInterest = calculateMonthlyInterestRate(interest);

	return monthlyInterest * debtAmount + debtAmount * 0.01;
}

function calculateMonthlyInterest(
	interest: number,
	debtAmount: number
): number {
	return calculateMonthlyInterestRate(interest) * debtAmount;
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

export function parseChartData(rawChartData: any): IStackData[] {
	return rawChartData.months.slice(1).map(month => {
		return {
			...month,
			month: formatDate(addMonths(new Date(), month.month), 'MMM YY'),
			values: Object.keys(month.values).reduce((acc, debtId: string) => {
				return {
					...acc,
					[debtId]: month.values[debtId].amountPaid
				};
			}, {})
		};
	});
}

export interface IRepaymentSchedule {
	extraContributions: number;
	months: {
		month: number;
		values: {
			[debtId: string]: {
				remainingBalance: number;
				amountPaid: number;
				interestPaid: number;
			};
		};
	}[];
}

function calculateRepayments(
	debts: IParsedDebt[],
	repaymentSchedule: IRepaymentSchedule
): IRepaymentSchedule {
	const lastMonth =
		repaymentSchedule.months[repaymentSchedule.months.length - 1];
	const totalDebtRemaining = lastMonth
		? Object.values(lastMonth.values).reduce((acc, value) => {
				return acc + value.remainingBalance;
		  }, 0)
		: 1;

	if (totalDebtRemaining <= 0) {
		return repaymentSchedule;
	}

	let extraContributions = repaymentSchedule.extraContributions;
	let paidOffDebts: IParsedDebt[] = Object.entries(lastMonth.values).reduce(
		(acc, [key, value]) => {
			const debt = debts.find(debt => debt.id === key);

			if (value.remainingBalance <= 0 && debt) {
				// @ts-ignore
				acc.push(debt);
			}

			return acc;
		},
		[]
	);
	/**
	 * TODO: fix edge case where you pay off a non priority 1 debt and it
	 * rolls funds into the next priority (e.g. priority 2 gets paid
	 * off, the remainder of that month's payment goes to priority 3
	 * instead of p1
	 */
	let extraFunds = paidOffDebts.reduce((acc, paidOffDebt) => {
		return acc + paidOffDebt.repayment;
	}, 0);

	const newRepaymentSchedule: IRepaymentSchedule = {
		...repaymentSchedule,
		months: [
			...repaymentSchedule.months,
			{
				month: lastMonth.month + 1,
				values: debts.reduce((acc, debt) => {
					const interestOnBalance = calculateMonthlyInterest(
						debt.rate,
						lastMonth.values[debt.id].remainingBalance
					);
					const balanceAsAtLastMonth =
						interestOnBalance +
						lastMonth.values[debt.id].remainingBalance;

					let amountPaid: number = 0;

					if (balanceAsAtLastMonth <= 0) {
						return {
							...acc,
							[debt.id]: {
								amountPaid: 0,
								interestPaid: 0,
								remainingBalance: 0
							}
						};
					}

					extraFunds = extraFunds + extraContributions;
					extraContributions = 0;

					if (balanceAsAtLastMonth < debt.repayment) {
						amountPaid = balanceAsAtLastMonth;
						extraFunds =
							extraFunds +
							(debt.repayment - balanceAsAtLastMonth);

						return {
							...acc,
							[debt.id]: {
								amountPaid,
								interestPaid: interestOnBalance,
								remainingBalance: 0
							}
						};
					}

					amountPaid = debt.repayment + extraFunds;

					// Reset this value because we've just used it for this debt
					extraFunds = 0;

					const newRemainingBalance =
						balanceAsAtLastMonth - amountPaid;
					return {
						...acc,
						[debt.id]: {
							amountPaid,
							interestPaid: interestOnBalance,
							remainingBalance: newRemainingBalance
						}
					};
				}, {})
			}
		]
	};

	return calculateRepayments(debts, newRepaymentSchedule);
}

export function calculateDebts({
	debtMethod,
	debts,
	extraContributions
}: ICalculateDebtArguments): IRepaymentSchedule {
	const parsedDebts = debts.map(parseDebt);
	const validDebts = parsedDebts.filter(isDebtValid);

	const sortedDebts =
		debtMethod === DEBT_PAYOFF_METHODS.SNOWBALL
			? sortArray(validDebts, sortByAmount)
			: sortArray(validDebts, sortByRate).reverse();

	return calculateRepayments(sortedDebts, {
		extraContributions,
		months: [
			{
				month: 0,
				values: sortedDebts.reduce((acc, debt) => {
					return {
						...acc,
						[debt.id]: {
							remainingBalance: debt.amount,
							amountPaid: 0
						}
					};
				}, {})
			}
		]
	});
}
