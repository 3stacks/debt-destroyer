export function sortArray(array, sortFunction) {
	return [...array].sort(sortFunction);
}

export function sortByRate(firstDebt, secondDebt) {
	return firstDebt.interest - secondDebt.interest;
}

export function sortByAmount(firstDebt, secondDebt) {
	return firstDebt.amount - secondDebt.amount;
}