import Vue from 'vue';
import addDebtForm from './components/add-debt-form';
import userDebts from './components/user-debts';
import debtStory from './components/debt-story';
import modal from './components/modal';
import {calculateDebts} from './utils/debt';
import VueMaterial from 'vue-material';
import {get, set} from '@lukeboyle/local-storage-manager';
import {defaultUserData} from './utils/constants';
import {updateLocalUserData} from './utils/local-storage';

Vue.use(VueMaterial);

const userData = getUserData();

function getUserData() {
	const localStorageUserData = get('userData', 'debt-destroyer');
	if (localStorageUserData) {
		return localStorageUserData;
	} else {
		set('userData', defaultUserData, 'debt-destroyer');
		return defaultUserData;
	}
}

const viewState = {
	debtMethod: 'snowball',
	editMode: true,
	addDebtMode: false,
	activeCharts: [],
	isPayOffHelpModalOpen: false
};

function destroyCharts() {
	viewState.activeCharts.forEach(chart => {
		chart.chart.destroy();
		const chartContainer = document.getElementById(chart.id);
		chartContainer.parentNode.removeChild(chartContainer);
	});
	return viewState.activeCharts = [];
}

const pageView = new Vue({
	el: '#root',
	methods: {
		handleDebtValueChanged(debtId, valueToChange, event) {
			const newDebts = userData.debts.map(debt => {
				if (debt.id === debtId) {
					if (valueToChange === 'amount') {
						const debtAmount = event.target.value;
						return {
							...debt,
							amount: debtAmount,
							minPayment: debtAmount * 0.01 < 5 ? 5 : debtAmount * 0.01
						}
					} else {
						return {
							...debt,
							[valueToChange]: event.target.value
						}
					}
				} else {
					return debt;
				}
			});
			userData.debts = newDebts;
			updateLocalUserData('debts', newDebts);
			calculateDebts({viewState, userData});
		},
		handleExtraContributionsChanged(changeEvent) {
			userData.extraContributions = changeEvent.target.value;
			if (userData.debts.length !== 0) {
				return calculateDebts({viewState, userData});
			}
		},
		handleDebtMethodChanged(changeEvent) {
			viewState.debtMethod = changeEvent.target.value;
			if (userData.debts.length !== 0) {
				destroyCharts();
				return calculateDebts({viewState, userData});
			}
		},
		handleNewDebtButtonPressed() {
			const newDebts = [
				...userData.debts,
				{
					id: `debt-${Math.random()}`,
					name: 'New debt',
					amount: 0,
					interest: 0,
					minPayment: 0
				}
			];
			userData.debts = newDebts;
			updateLocalUserData('debts', newDebts);
		},
		handleDeleteDebtButtonPressed(debtId) {
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
		},
		handlePayOffHelpButtonPressed() {
			return viewState.isPayOffHelpModalOpen = !viewState.isPayOffHelpModalOpen;
		}
	},
	data: {
		viewState,
		userData
	},
	components: {
		'modal-dialog': modal,
		'add-debt-form': addDebtForm,
		'user-debts': userDebts,
		'debt-story': debtStory
	}
});

window.zz = pageView;

function destroyElement(element) {
	element.parentNode.removeChild(element);
}