import {updateLocalUserData, clearUserData} from 'utils/local-storage';

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
	const chartToRemove = viewState.activeCharts.find(chart => {
		return debtId === chart.id;
	});
	if (chartToRemove) {
		chartToRemove.chart.destroy();
		destroyElement(document.getElementById(debtId));
	}
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