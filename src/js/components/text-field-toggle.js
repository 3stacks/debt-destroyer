export default {
	props: {
		label: {
			type: String,
			required: true
		},
		type: String,
		placeholder: String,
		value: {
			type: [
				String,
				Number
			],
			default: ''
		},
		handleValueChanged: {
			type: Function,
			required: true
		},
		debt: {
			type: Object,
			required: true
		},
		property: String
	},
	methods: {
		handleInputChange(keyboardEvent) {
			const input = keyboardEvent.target;
			const debt = this.$props.debt;
			return this.$props.handleValueChanged(debt.id, this.$props.property, input.value);
		}
	},
	template: `
		<div class="component__text-field-toggle">
			<label>
				{{ label }}:
				<input ref="input" @input="handleInputChange" v-bind:value="value" :type="type" v-bind:placeholder="placeholder">
			</label>
		</div>
	`
}
