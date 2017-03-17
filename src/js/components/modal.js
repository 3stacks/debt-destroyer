export default {
	template: `
		<div class="modal is-active">
			<div class="modal-background" @click="handleCloseRequested"></div>
			<div class="modal-card" tabindex="1" ref="modal">
				<header class="modal-card-head">
					<p class="modal-card-title">
						{{ title }}
					</p>
					<button class="delete" @click="handleCloseRequested">
						&times;
					</button>
				</header>
				
				<section class="modal-card-body">
					<slot name="body"></slot>
				</section>
				
				<footer class="modal-card-foot">
					<slot name="footer"></slot>
				</footer>
			</div>
		</div>
	`,
	props: {
		isOpen: Boolean,
		handleCloseRequested: {
			type: Function,
			required: true
		},
		title: String
	},
	methods: {
		handleKeyDown(keyEvent) {
			if (keyEvent.key === 'Escape') {
				this.$props.handleCloseRequested();
			}
		}
	},
	mounted() {
		const modal = this.$refs.modal;
		modal.focus();
		modal.addEventListener('keydown', this.handleKeyDown);
	},
	beforeDestroy() {
		this.$refs.modal.removeEventListener('keydown', this.handleKeyDown);
	}
}