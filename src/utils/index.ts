import { IDebt } from '../components/app/app';
import nanoid from 'nanoid';
import { errorTemplate } from '../constants';
import { IError, IErrorFields } from '../@types';

export enum DEBT_PAYOFF_METHODS {
	SNOWBALL = 'snowball',
	AVALANCHE = 'avalanche'
}

export interface IStackData {
	month: string;
	remainingBalance: number;
	values: {
		[debtName: string]: {
			amountPaid: number;
			remainingBalance: number;
		};
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

export function calculateMinimumMonthlyRepayment(
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

export function parseChartData(rawChartData: IRepaymentSchedule): IStackData[] {
	return rawChartData.months.slice(1).map(month => {
		const values = Object.keys(month.values).reduce(
			(acc, debtId: string) => {
				return {
					...acc,
					[debtId]: {
						amountPaid: month.values[debtId].amountPaid,
						remainingBalance: month.values[debtId].remainingBalance
					}
				};
			},
			{}
		);

		return {
			...month,
			month: `${month.month}`,
			remainingBalance: Object.keys(values).reduce(
				(acc, curr) => acc + values[curr].remainingBalance,
				0
			),
			values
		};
	});
}

export interface IRepaymentSchedule {
	extraContributions: number;
	// so we don't have to do deep equality checks on the whole tree to
	// figure out if it has been recalculated
	guid: string;
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

	const firstDebtNotPaidOff : number = debts.findIndex(debt => {
		return lastMonth.values[debt.id].remainingBalance > 0;
	});
	let otherDebtRemainder = debts.slice(firstDebtNotPaidOff).reduce((acc, debt) => {
		const thisDebtLastMonth = lastMonth.values[debt.id];
		return thisDebtLastMonth.remainingBalance > 0 && thisDebtLastMonth.remainingBalance <= debt.repayment ? debt.repayment - thisDebtLastMonth.remainingBalance : 0
	}, 0);
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

					extraFunds = extraFunds + extraContributions + otherDebtRemainder;
					extraContributions = 0;
					otherDebtRemainder = 0;

					if (balanceAsAtLastMonth < debt.repayment + extraFunds) {
						const standardPaymentRemainder =
							debt.repayment - Math.round(balanceAsAtLastMonth);

						amountPaid = Math.round(balanceAsAtLastMonth);
						extraFunds = extraFunds + standardPaymentRemainder;

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
		guid: nanoid(),
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

export function editDebt(debt: IDebt, key: keyof IDebt, value: string): IDebt {
	return {
		...debt,
		[key]: value
	};
}

export function editRow(
	rows: IDebt[],
	rowIndex: number,
	key: keyof IDebt,
	value: string
) {
	const newValue = [...rows];

	newValue[rowIndex] = editDebt(newValue[rowIndex], key, value);

	return newValue;
}

function validateFields(
	error: IError,
	debt: IDebt,
	debtProperty: keyof IDebt,
	newValue: string
): IErrorFields {
	// we construct a new debt to base validations off
	const newDebt = {
		...debt,
		[debtProperty]: newValue
	};

	if (debtProperty === 'amount' && parseInt(newDebt.amount, 10) <= 0) {
		return error.fields.set('amount', {
			error: true,
			message: 'Amount should be more than 0'
		});
	}

	if (
		debtProperty === 'amount' ||
		debtProperty === 'repayment' ||
		debtProperty === 'rate'
	) {
		const valueAsNumber = parseInt(newDebt[debtProperty], 10);
		const isItNaN = Number.isNaN(valueAsNumber);

		if (isItNaN) {
			return error.fields.set(debtProperty, {
				error: true,
				message: 'Value must be a number'
			});
		}

		const repayment = parseInt(newDebt.repayment, 10);
		const minPayment = calculateMinimumMonthlyRepayment(
			parseInt(newDebt.rate, 10),
			parseInt(newDebt.amount, 10)
		);

		if (repayment < minPayment) {
			return error.fields.set('repayment', {
				error: true,
				message: `Minimum repayment is $${minPayment.toFixed(2)}`
			});
		} else {
			error.fields.set('repayment', errorTemplate);
		}
	}

	return error.fields.set(debtProperty, {
		error: false,
		message: ''
	});
}

export function validateRow(
	errors: IError[],
	debtIndex: number,
	debt: IDebt,
	debtProperty: keyof IDebt,
	newValue: string
): IError[] {
	errors[debtIndex] = {
		...errors[debtIndex],
		fields: validateFields(errors[debtIndex], debt, debtProperty, newValue)
	};

	return errors;
}
