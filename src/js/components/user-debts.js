import textFieldToggle from './text-field-toggle';

export default {
	template: `
		<div class="flex-grid" v-if="debts.length !== 0" >
			<md-card v-for="debt in debts" class="user-debt" key="debt.id">
				<md-card-header>
					<md-card-header-text>
						<div class="md-title">{{ debt.name }}</div>
					</md-card-header-text>
					<md-menu md-size="4" md-direction="bottom left">
						<md-button class="md-icon-button" md-menu-trigger>
							<md-icon>more_vert</md-icon>
						</md-button>
						
						<md-menu-content>
							<md-menu-item @click.native="handleDeleteDebtButtonPressed(debt.id)">
								<span>Delete Debt</span>
								<md-icon>delete</md-icon>
							</md-menu-item>
						</md-menu-content>
					</md-menu>
				</md-card-header>
				<md-card-content>
					<md-input-container>
						<label>Debt Name</label>
						<md-input 
							placeholder="Enter the name of your debt" 
							type="text" 
							@input.native="handleValueChanged(debt.id, 'name', $event)"
							:value="debt.name"
						></md-input>
					</md-input-container>
					<md-input-container>
						<label>Debt Amount ($)</label>
						<md-input 
							placeholder="Enter the amount left in the debt" 
							type="number"
							@input.native="handleValueChanged(debt.id, 'amount', $event)"
							:value="debt.amount"
						></md-input>
					</md-input-container>
					<md-input-container>
						<label>
							Annual Percentage Rate (%)
						</label>
						<md-input 
							placeholder="Enter the APR of the debt" 
							type="number"
							@input.native="handleValueChanged(debt.id, 'interest', $event)"
							:value="debt.interest"
						></md-input>
					</md-input-container>
					<md-input-container>
						<label>
							Minimum Monthly Repayment ($)
						</label>
						<md-input 
							placeholder="Enter your monthly repayment" 
							type="number"
							@input.native="handleValueChanged(debt.id, 'minPayment', $event)"
							:value="debt.minPayment"
						></md-input>
					</md-input-container>
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