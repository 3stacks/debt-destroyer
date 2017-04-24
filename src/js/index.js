import Vue from 'vue';
import VueMaterial from 'vue-material';
import addDebtForm from './components/add-debt-form';
import userDebts from './components/user-debts';
import modal from './components/modal';
import chart from './components/chart';
import { calculateDebts } from './utils/debt';
import { updateLocalUserData, getUserData, clearUserData } from './utils/local-storage';
import { destroyElement } from './utils/functions';
import debounce from 'lodash/debounce';
import { sortArray, sortByRate, sortByAmount } from './utils/functions';

Vue.use(VueMaterial);

const userData = getUserData();

const viewState = {
	debtMethod: 'snowball',
	editMode: true,
	addDebtMode: false,
	activeCharts: [],
	isPayOffHelpModalOpen: false,
	isSideNavOpen: false,
	isAboutModalOpen: false
};

function getDebtOrder(debtMethod, userData) {
	return debtMethod === 'snowball' ? sortArray(userData.debts, sortByAmount) : sortArray(userData.debts, sortByRate).reverse();
}

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
		},
		handleMenuButtonPressed() {
			return viewState.isSideNavOpen = !viewState.isSideNavOpen;
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
	mounted() {
		requestAnimationFrame(() => {
			document.querySelectorAll('.cloak').forEach(element => {
				return element.classList.remove('cloak');
			});

			if (userData.debts.length !== 0) {
				calculateDebts({viewState, userData});
			}
		});
		// Add listener for closing sidenav on blur
		document.querySelector('.md-sidenav-backdrop').addEventListener('click', () => viewState.isSideNavOpen = !viewState.isSideNavOpen);
	},
	components: {
		chart,
		'modal-dialog': modal,
		'add-debt-form': addDebtForm,
		'user-debts': userDebts,
		'debt-story': debtStory
	}
});

if (process.env.NODE_ENV !== 'production') {
	window.zz = pageView;
}
