import {defaultUserData} from './constants';
import locationManager from './location-manager';

export function updateLocalUserData(keyToChange, dataToChange) {
	if (keyToChange === 'userData') {
		locationManager.hash('userData', JSON.stringify(dataToChange));
	} else {
		locationManager.hash('userData', JSON.stringify({
			...getUserData(),
			[keyToChange]: dataToChange
		}));
	}
}

export function getUserData() {
	const userData = locationManager.hash('userData');
	if (userData) {
		return JSON.parse(userData);
	} else {
		updateLocalUserData('userData', defaultUserData);
		return defaultUserData;
	}
}

export function clearUserData() {
	locationManager.hash('userData', '');
}