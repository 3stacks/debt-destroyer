import textFieldToggle from './text-field-toggle';

export default {
	template: `
		<div>
			<div v-if="debts.length !== 0" v-for="debt in debts">
				<text-field-toggle 
					label="Debt Name" 
					type="text"
					placeholder="Enter the name of your debt"
					:debt="debt"
					:value="debt.name"
					:handle-value-changed="handleValueChanged"
				></text-field-toggle>
				<text-field-toggle 
					label="Debt Amount"
					type="number"
					placeholder="Enter the amount left in the debt"
					:debt="debt"
					:value="debt.amount"
					:handle-value-changed="handleValueChanged"
				></text-field-toggle>
				<text-field-toggle 
					label="Annual Percentage Rate"
					type="number"
					placeholder="Enter the APR of the debt"
					:debt="debt"
					:value="debt.interest"
					:handle-value-changed="handleValueChanged"
				></text-field-toggle>
				<text-field-toggle 
					label="Minimum Monthly Repayment" 
					type="number"
					placeholder="Enter your monthly repayment"
					:debt="debt"
					:value="debt.minPayment"
					:handle-value-changed="handleValueChanged"
				></text-field-toggle>
			</div>
		</div>
	`,
	components: {
		'text-field-toggle': textFieldToggle
	},
	props: {
		handleValueChanged: Function,
		editMode: Boolean,
		debts: Array
	}
}