import textFieldToggle from './text-field-toggle';

export default {
	template: `
		<div class="flex-grid" v-if="debts.length !== 0" >
			<md-card v-for="debt in debts" class="user-debt" key="debt.id">
				<md-card-header>
					<md-card-header-text>
						<div class="md-title">{{ debt.name }}</div>
					</md-card-header-text>
					<md-button class="md-icon-button" @click.native="handleDeleteDebtButtonPressed(debt.id)">
						<md-icon>delete</md-icon>
					</md-button>
				</md-card-header>
				<md-card-content>
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
				</md-card-content>
			</md-card>
			<div class="user-debt"></div>
			<div class="user-debt"></div>
		</div>
	`,
	components: {
		'text-field-toggle': textFieldToggle
	},
	props: {
		handleValueChanged: Function,
		handleDeleteDebtButtonPressed: Function,
		editMode: Boolean,
		debts: Array
	}
}