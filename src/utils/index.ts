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

function calculateMonthlyInterest(interest: number, debtAmount: number) {
	return calculateMonthlyInterestRate(interest) * debtAmount * 100;
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
	console.log(rawChartData);
	return rawChartData.months.map(month => {
		return {
			...month,
			values: Object.keys(month.values).reduce((acc, debtId: string) => {
				return {
					...acc,
					[debtId]: month.values[debtId].amountPaid
				};
			}, {})
		};
	});
}

interface IRepaymentSchedule {
	extraContributions: number;
	months: {
		month: number;
		values: {
			[debtId: string]: {
				remainingBalance: number;
				amountPaid: number;
			};
		};
	}[];
}

// TODO: calculate monthly interest
// TODO: calculate extra contributions
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

	if (totalDebtRemaining > 0) {
		let extraFunds = 0;
		const newRepaymentSchedule: IRepaymentSchedule = {
			...repaymentSchedule,
			months: [
				...repaymentSchedule.months,
				{
					month: lastMonth.month + 1,
					values: debts.reduce((acc, debt) => {
						const balanceAsAtLastMonth =
							lastMonth.values[debt.id].remainingBalance;
						let amountPaid: number;

						if (balanceAsAtLastMonth <= 0) {
							return {
								...acc,
								[debt.id]: {
									amountPaid: 0,
									remainingBalance: 0
								}
							};
						}

						if (balanceAsAtLastMonth < debt.repayment) {
							amountPaid = balanceAsAtLastMonth;
							extraFunds =
								extraFunds +
								(debt.repayment - balanceAsAtLastMonth);
						} else {
							amountPaid = debt.repayment + extraFunds;

							// Reset this value because we've just used it for this debt
							extraFunds = 0;
						}

						const newRemainingBalance =
							balanceAsAtLastMonth - amountPaid;

						return {
							...acc,
							[debt.id]: {
								amountPaid,
								remainingBalance: newRemainingBalance
							}
						};
					}, {})
				}
			]
		};

		return calculateRepayments(debts, newRepaymentSchedule);
	}

	return repaymentSchedule;
}

export function calculateDebts({
	debtMethod,
	debts,
	extraContributions
}: ICalculateDebtArguments) {
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
