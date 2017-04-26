import {defaultUserData} from './constants';
import locationManager from './location-manager';
import { Base64 } from 'js-base64';

export function updateLocalUserData(keyToChange, dataToChange) {
	if (keyToChange === 'userData') {
		locationManager.hash('userData', Base64.encode(JSON.stringify(dataToChange)));
	} else {
		const data = JSON.stringify({
			...getUserData(),
			[keyToChange]: dataToChange
		});
		locationManager.hash('userData', Base64.encode(data));
	}
}

export function getUserData() {
	const encodedUserData = locationManager.hash('userData');
	if (!!encodedUserData) {
		return JSON.parse(Base64.decode(encodedUserData));
	} else {
		updateLocalUserData('userData', defaultUserData);
		return defaultUserData;
	}
}

export function clearUserData() {
	locationManager.hash('userData', '');
}