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
		}
	},
	methods: {
		handleKeyDown(KeyboardEvent) {
			const input = KeyboardEvent.target;
			if (KeyboardEvent.key === 'Escape') {
				return input.value = this.$props.value;
			}
			if (KeyboardEvent.key === 'Enter') {
				return this.$props.handleValueChanged(input.value);
			}
		},
		handleBlur() {
			return this.$refs.input.value = this.$props.value;
		}
	},
	template: `
		<div class="component__text-field-toggle">
			<label>
				{{ label }}:
				<input ref="input" @blur="handleBlur" @keydown="handleKeyDown" v-bind:value="value" :type="type" v-bind:placeholder="placeholder">
			</label>
		</div>
	`
}
