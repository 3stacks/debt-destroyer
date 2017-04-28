import Vue from 'vue';
import VueMaterial from 'vue-material';
import addDebtForm from './components/add-debt-form';
import userDebts from './components/user-debts';
import modal from './components/modal';
import chart from './components/chart';
import { calculateDebts } from './utils/debt';
import { updateLocalUserData, getUserData, clearUserData } from './utils/local-storage';
import { themeColors, DEFAULT_ERRORS } from './utils/constants';
import debounce from 'lodash/debounce';
import syncVar from '@lukeboyle/sync-vars';

Vue.use(VueMaterial);

Vue.material.registerTheme('default', themeColors);

const rootElement = document.querySelector('html');

Object.entries(themeColors).map(([color, value]) => {
	syncVar(rootElement, color, value.hex);
});

export const userData = getUserData();

const viewState = {
	debtMethod: 'snowball',
	activeCharts: [],
	isPayOffHelpModalOpen: false,
	isSideNavOpen: false,
	isAboutModalOpen: false,
	chartLabels: []
};

const debouncedHandleDebtValueChanged = debounce((debtId, valueToChange, event) => {
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

const debouncedHandleExtraContributionsChanged = debounce(changeEvent => {
	const extraContributionsAmount = changeEvent.target.value;
	userData.extraContributions = extraContributionsAmount;
	updateLocalUserData('extraContributions', extraContributionsAmount);
	if (userData.debts.length !== 0) {
		return calculateDebts({viewState, userData});
	}
}, 500);

const pageView = new Vue({
	el: '#root',
	methods: {
		handleDebtValueChanged: debouncedHandleDebtValueChanged,
		handleExtraContributionsChanged: debouncedHandleExtraContributionsChanged,
		handleDebtMethodChanged(debtMethod) {
			viewState.debtMethod = debtMethod;
			if (userData.debts.length !== 0) {
				return calculateDebts({viewState, userData});
			}
		},
		handleNewDebtButtonPressed() {
			const newDebts = [
				...userData.debts,
				// The ID is random enough for this use case, we're not worried about a clash, however, for the next
				// version a GUID will be added for IDs to make this more robust
				{
					id: `debt-${Math.random().toString().slice(2)}`,
					dateAdded: Date.now(),
					name: 'New debt',
					amount: 0,
					interest: 0,
					minPayment: 0,
					errors: DEFAULT_ERRORS
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
			if (userData.debts.length !== 0) {
				return calculateDebts({viewState, userData});
			}
		},
		handlePayOffHelpButtonPressed() {
			return viewState.isPayOffHelpModalOpen = !viewState.isPayOffHelpModalOpen;
		},
		handleAboutButtonPressed() {
			return viewState.isAboutModalOpen = !viewState.isAboutModalOpen;
		},
		clearLocalStorageData() {
			userData.debts = [];
			viewState.extraContributions = null;
			clearUserData();
		}
	},
	data: {
		viewState,
		userData
	},
	computed: {
		debtsSortedByDate: function() {
			return userData.debts.sort((a, b) => {
				return a.dateAdded - b.dateAdded;
			})
		},
		sortedCharts: function() {
			if (userData.activeCharts.length === 0) {
				return [];
			} else {
				return userData.paidOffDebts.reduce((acc, curr) => {
					if (curr.repayments) {
						const theChart = userData.activeCharts.find(chart => chart.id === curr.id);
						return [
							...acc,
							theChart
						]
					} else {
						return acc;
					}
				}, []);
			}
		}
	},
	watch: {
		sortedCharts: function(newValue) {
			Vue.set(pageView, 'sortedCharts', newValue);
		},
		debtsSortedByDate: function(newValue) {
			Vue.set(pageView, 'debtsSortedByDate', newValue);
		}
	},
	mounted() {
		requestAnimationFrame(() => {
			document.querySelectorAll('.cloak').forEach(element => {
				element.classList.remove('cloak');
			});

			if (userData.debts.length !== 0) {
				calculateDebts({viewState, userData});
			}
		});
	},
	components: {
		chart,
		'modal-dialog': modal,
		'add-debt-form': addDebtForm,
		'user-debts': userDebts
	}
});

if (process.env.NODE_ENV !== 'production') {
	window.zz = pageView;
}
