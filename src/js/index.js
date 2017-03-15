import Vue from 'vue';
import addDebtForm from './components/add-debt-form';
import userDebts from './components/user-debts';
import {calculateDebts} from './utils/debt';

const userData = {
	debts: [
		{
			id: 1,
			name: 'St George',
			amount: 5700,
			interest: 0,
			minPayment: 120,
			paidOff: false
		},
		{
			id: 2,
			name: 'CBA',
			amount: 2400,
			interest: 12,
			minPayment: 200,
			paidOff: false
		},
		{
			id: 3,
			name: 'Personal Loan',
			amount: 9500,
			interest: 16,
			minPayment: 524,
			paidOff: false
		}
	],
	extraContributions: 4055,
};

const viewState = {
	debtMethod: 'avalanche',
	editMode: true,
	addDebtMode: false,
	activeCharts: []
};

const pageView = new Vue({
	el: '#root',
	methods: {
		handleDebtValueChanged(debtId, valueToChange, newValue) {
			userData.debts = userData.debts.map(debt => {
				if (debt.id === debtId) {
					return {
						...debt,
						[valueToChange]: newValue
					}
				} else {
					return debt;
				}
			});
			if (valueToChange !== 'name') {
				return calculateDebts({viewState, userData});
			}
		},
		handleExtraContributionsChanged(changeEvent) {
			userData.extraContributions = changeEvent.target.value;
			return calculateDebts({viewState, userData});
		},
		handleDebtMethodChanged(changeEvent) {
			viewState.debtMethod = changeEvent.target.value;
			return calculateDebts({viewState, userData});
		}
	},
	data: {
		viewState,
		userData
	},
	components: {
		'add-debt-form': addDebtForm,
		'user-debts': userDebts
	}
});

window.zz = pageView;