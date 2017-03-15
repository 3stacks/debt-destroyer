import textFieldToggle from './text-field-toggle';

export default {
	template: `
		<div class="component__user-debt__container">
			<div v-if="debts.length !== 0" v-for="debt in debts" class="component__user-debt">
				<text-field-toggle 
					label="Debt Name" 
					type="text"
					placeholder="Enter the name of your debt"
					property="name"
					:debt="debt"
					:value="debt.name"
					:handle-value-changed="handleValueChanged"
				></text-field-toggle>
				<text-field-toggle 
					label="Debt Amount"
					type="number"
					placeholder="Enter the amount left in the debt"
					property="amount"
					:debt="debt"
					:value="debt.amount"
					:handle-value-changed="handleValueChanged"
				></text-field-toggle>
				<text-field-toggle 
					label="Annual Percentage Rate"
					type="number"
					placeholder="Enter the APR of the debt"
					property="interest"
					:debt="debt"
					:value="debt.interest"
					:handle-value-changed="handleValueChanged"
				></text-field-toggle>
				<text-field-toggle 
					label="Minimum Monthly Repayment" 
					type="number"
					placeholder="Enter your monthly repayment"
					property="minPayment"
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