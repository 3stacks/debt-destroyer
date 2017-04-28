export function sortArray(array, sortFunction) {
	return [...array].sort(sortFunction);
}

export function sortByRate(firstDebt, secondDebt) {
	return firstDebt.interest - secondDebt.interest;
}

export function sortByAmount(firstDebt, secondDebt) {
	return firstDebt.amount - secondDebt.amount;
}

export function destroyElement(element) {
	element.parentNode.removeChild(element);
}

export function writeCssVar(element, varName, value){
	return element.style.setProperty(`--${varName}`, value);
}

function getDebtOrder(debtMethod, userData) {
	return debtMethod === 'snowball' ? sortArray(userData.debts, sortByAmount) : sortArray(userData.debts, sortByRate).reverse();
}