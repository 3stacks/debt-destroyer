import Vue from 'vue';
import VueMaterial from 'vue-material';
import addDebtForm from './components/add-debt-form';
import userDebts from './components/user-debts';
import nanoid from 'nanoid';
import modal from './components/modal';
import chart from './components/chart';
import { calculateDebts } from './utils/debt';
import { updateLocalUserData, getUserData, clearUserData } from './utils/local-storage';
import { themeColors, DEFAULT_ERRORS, DEBT_PAYOFF_METHOD } from './utils/constants';
import debounce from 'lodash/debounce';
import syncVar from '@lukeboyle/sync-vars';
import {Base64} from "js-base64";
import locationManager from "./utils/location-manager";

Vue.use(VueMaterial);

Vue.material.registerTheme('default', themeColors);

const rootElement = document.querySelector('html');

Object.entries(themeColors).map(([color, value]) => {
	syncVar(rootElement, color, value.hex);
});

export const userData = getUserData();

const viewState = {
	debtMethod: DEBT_PAYOFF_METHOD.SNOWBALL,
	activeCharts: [],
	isPayOffHelpModalOpen: false,
	isSideNavOpen: false,
	isAboutModalOpen: false,
	isShareModalOpen: false,
	chartLabels: []
};

function copyTextToClipboard(text) {
	const textArea = !!window.copyTextArea ? window.copyTextArea : document.createElement('textarea');
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	document.execCommand('copy');

	document.body.removeChild(textArea);
	window.copyTextArea = textArea;
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
				{
					id: `debt-${nanoid()}`,
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
			const newDebts = userData.debts.filter(debt => debtId !== debt.id);
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
		handleShareButtonPressed() {
			return viewState.isShareModalOpen = !viewState.isShareModalOpen;
		},
		clearLocalStorageData() {
			userData.debts = [];
			viewState.extraContributions = null;
			clearUserData();
		},
		handleIframeShareButtonPressed() {
			const data = JSON.stringify({
				...getUserData(),
				embedMode: true
			});

			copyTextToClipboard(`<iframe src="${window.location.origin}${window.location.pathname}/#userData=${Base64.encode(data)}"></iframe>`);
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

			viewState.embedMode = userData.embedMode || false
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
