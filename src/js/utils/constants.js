export const DEFAULT_ERRORS = {
	hasErrors: false,
	name: {
		error: false,
		message: null
	},
	amount: {
		error: false,
		message: null
	},
	interest: {
		error: false,
		message: null
	},
	minPayment: {
		error: false,
		message: null
	}
};

export const defaultUserData = {
	debts: [
		{
			id: 'debt-1',
			name: 'Sample Debt',
			dateAdded: Date.now(),
			amount: 10000,
			minPayment: 524,
			interest: 16,
			errors: DEFAULT_ERRORS,
			paidOffDebts: []
		}
	],
	extraContributions: null,
	activeCharts: []
};

export const COLORS = {
	BLUE: {
		hex: '#2196f3',
		color: 'blue',
		hue: 500
	},
	RED: {
		hex: '#F44336',
		color: 'red',
		hue: 500
	},
	WHITE: {
		hex: '#fff',
		color: 'white',
		hue: 500
	}
};

export const themeColors = {
	primary: COLORS.BLUE,
	accent: COLORS.RED,
	warn: COLORS.RED,
	background: COLORS.WHITE
};