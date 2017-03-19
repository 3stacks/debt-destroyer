import {defaultUserData} from './constants';
import {get, set} from '@lukeboyle/local-storage-manager';

export function updateLocalUserData(keyToChange, dataToChange) {
	const localUserData = get('userData', 'debt-destroyer');
	return set('userData', {
		...localUserData,
		[keyToChange]: dataToChange
	}, 'debt-destroyer');
}

export function getUserData() {
	const localStorageUserData = get('userData', 'debt-destroyer');
	if (localStorageUserData) {
		return localStorageUserData;
	} else {
		set('userData', defaultUserData, 'debt-destroyer');
		return defaultUserData;
	}
}