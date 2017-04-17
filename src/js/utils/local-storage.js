import {defaultUserData} from './constants';
import locationManager from './location-manager';

export function updateLocalUserData(keyToChange, dataToChange) {
	if (keyToChange === 'userData') {
		const data = JSON.stringify(dataToChange);
		locationManager.hash('userData', btoa(data));
	} else {
		const data = JSON.stringify({
			...getUserData(),
			[keyToChange]: dataToChange
		});
		locationManager.hash('userData', btoa(data));
	}
}

export function getUserData() {
	const encodedUserData = locationManager.hash('userData');
	if (encodedUserData) {
		const userData = atob(encodedUserData);
		return JSON.parse(userData);
	} else {
		updateLocalUserData('userData', btoa(defaultUserData));
		return defaultUserData;
	}
}

export function clearUserData() {
	locationManager.hash('userData', '');
}