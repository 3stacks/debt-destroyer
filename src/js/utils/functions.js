import locationManager from './location-manager';

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

export function setUserDataInUrl(userData) {
	locationManager.hash('userData', JSON.parse(userData));
}