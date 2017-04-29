import textFieldToggle from './text-field-toggle';

export default {
	template: `
		<div class="flex-grid" v-if="debts.length !== 0" >
			<transition name="fade" v-for="debt in debts" key="debt.id">
				<md-card class="user-debt">
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
						<md-input-container :class="{'md-input-invalid': debt.errors.name.error}">
							<label>Debt Name</label>
							<md-input 
								placeholder="Enter the name of your debt" 
								type="text" 
								@input.native="handleValueChanged(debt.id, 'name', $event)"
								:value="debt.name"
							></md-input>
							<span v-if="debt.errors.name.error" class="md-error">{{debt.errors.name.message}}</span>
						</md-input-container>
						<md-input-container :class="{'md-input-invalid': debt.errors.amount.error}">
							<label>Debt Amount ($)</label>
							<md-input 
								placeholder="Enter the amount left in the debt" 
								type="number"
								@input.native="handleValueChanged(debt.id, 'amount', $event)"
								:value="debt.amount"
							></md-input>
							<span v-if="debt.errors.amount.error" class="md-error">{{debt.errors.amount.message}}</span>
						</md-input-container>
						<md-input-container :class="{'md-input-invalid': debt.errors.interest.error}">
							<label>
								Annual Percentage Rate (%)
							</label>
							<md-input
								placeholder="Enter the APR of the debt" 
								type="number"
								@input.native="handleValueChanged(debt.id, 'interest', $event)"
								:value="debt.interest"
							></md-input>
							<span v-if="debt.errors.interest.error" class="md-error">{{debt.errors.interest.message}}</span>
						</md-input-container>
						<md-input-container :class="{'md-input-invalid': debt.errors.minPayment.error}">
							<label>
								Minimum Monthly Repayment ($)
							</label>
							<md-input 
								placeholder="Enter your monthly repayment" 
								type="number"
								@input.native="handleValueChanged(debt.id, 'minPayment', $event)"
								:value="debt.minPayment"
							></md-input>
							<span v-if="debt.errors.minPayment.error" class="md-error">{{debt.errors.minPayment.message}}</span>
						</md-input-container>
					</md-card-content>
				</md-card>
			</transition>
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