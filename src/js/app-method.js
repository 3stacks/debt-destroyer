import {updateLocalUserData, clearUserData} from 'utils/local-storage';
import { destroyElement } from 'utils/functions';
import { calculateDebts} from 'utils/debt';

/**
 * Changes the debt payoff method i.e. snowball/avalanche and then calculates debts.
 * @param userData {Object}
 * @param viewState {Object}
 * @param debtMethod
 * @returns {*}
 */
export function handleDebtMethodChanged(userData, viewState, debtMethod) {
	viewState.debtMethod = debtMethod;
	if (userData.debts.length !== 0) {
		destroyCharts(viewState);
		return calculateDebts({viewState, userData});
	}
}

export function handleNewDebtButtonPressed(userData) {
	const newDebts = [
		...userData.debts,
		// The ID is random enough for this use case, we're not worried about a clash, however, for the next
		// version a GUID will be added for IDs to make this more robust
		{
			id: `debt-${Math.random().toString().slice(2)}`,
			name: 'New debt',
			amount: 0,
			interest: 0,
			minPayment: 0,
			error: {
				target: null,
				message: null
			}
		}
	];
	userData.debts = newDebts;
	updateLocalUserData('debts', newDebts);
}

export function handleDeleteDebtButtonPressed(debtId, viewState, userData) {
	const newDebts = userData.debts.filter(debt => {
		if (debtId !== debt.id) {
			return debt;
		}
	});
	userData.debts = newDebts;
	updateLocalUserData('debts', newDebts);
	if (userData.debts.length !== 0) {
		return calculateDebts({viewState, userData});
	}
}

export function handlePayOffHelpButtonPressed(viewState) {
	return viewState.isPayOffHelpModalOpen = !viewState.isPayOffHelpModalOpen;
}

export function handleMenuButtonPressed(viewState) {
	return viewState.isSideNavOpen = !viewState.isSideNavOpen;
}

export function handleAboutButtonPressed(viewState) {
	return viewState.isAboutModalOpen = !viewState.isAboutModalOpen;
}

function clearLocalStorageData(viewState, userData) {
	userData.debts = [];
	viewState.extraContributions = null;
	destroyCharts(viewState);
	clearUserData();
}

export const debouncedHandleDebtValueChanged = debounce((debtId, valueToChange, event) => {
	const newDebts = userData.debts.map(debt => {
		if (debt.id === debtId) {
			return {
				...debt,
				[valueToChange]: event.target.value
			}
		} else {
			return debt;
		}
	});
	userData.debts = newDebts;
	updateLocalUserData('debts', newDebts);
	calculateDebts({viewState, userData});
}, 500);

export const debouncedHandleExtraContributionsChanged = debounce(changeEvent => {
	const extraContributionsAmount = changeEvent.target.value;
	userData.extraContributions = extraContributionsAmount;
	updateLocalUserData('extraContributions', extraContributionsAmount);
	if (userData.debts.length !== 0) {
		return calculateDebts({viewState, userData});
	}
}, 500);