import moment from 'moment';

export default {
	props: {
		userData: {
			type: Object,
			required: true
		}
	},
	computed: {
		debtDuration() {
			const processedDebts = this.props.userData.processedDebts;
		}
	},
	template: `
		<div>
			<p>
				It took you 
			</p>
		</div>
	`
}