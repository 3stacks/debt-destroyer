import Vue from 'vue';
import addDebtForm from './components/add-debt-form';
import userDebts from './components/user-debts';
import debtStory from './components/debt-story';
import modal from './components/modal';
import {calculateDebts} from './utils/debt';
import VueMaterial from 'vue-material';

Vue.use(VueMaterial);

const userData = {
	debts: [
		{
			id: '1',
			name: 'Personal Loan',
			amount: 10000,
			minPayment: 524,
			interest: 0
		},
		{
			id: '2',
			name: 'Personal Loan',
			amount: 10000,
			minPayment: 524,
			interest: 0
		}
	],
	extraContributions: 1000,
};

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
			userData.debts = userData.debts.map(debt => {
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
			if (valueToChange !== 'name') {
				calculateDebts({viewState, userData});
			}
		},
		handleExtraContributionsChanged(changeEvent) {
			userData.extraContributions = changeEvent.target.value;
			return calculateDebts({viewState, userData});
		},
		handleDebtMethodChanged(changeEvent) {
			viewState.debtMethod = changeEvent.target.value;
			destroyCharts();
			return calculateDebts({viewState, userData});
		},
		handleNewDebtButtonPressed() {
			userData.debts = [
				...userData.debts,
				{
					id: `debt-${Math.random()}`,
					name: 'New debt',
					amount: 0,
					interest: 0,
					minPayment: 0
				}
			]
		},
		handleDeleteDebtButtonPressed(debtId) {
			userData.debts = userData.debts.filter(debt => {
				if (debtId !== debt.id) {
					return debt;
				}
			});
			const chartToRemove = viewState.activeCharts.find(chart => {
				return debtId === chart.id;
			});
			destroyElement(document.getElementById(debtId));
			chartToRemove.chart.destroy();

			return calculateDebts({viewState, userData});
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