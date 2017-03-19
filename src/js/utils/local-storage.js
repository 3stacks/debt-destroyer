import {get, set} from '@lukeboyle/local-storage-manager';

export function updateLocalUserData(keyToChange, dataToChange) {
	const localUserData = get('userData', 'debt-destroyer');
	return set('userData', {
		...localUserData,
		[keyToChange]: dataToChange
	}, 'debt-destroyer');
}