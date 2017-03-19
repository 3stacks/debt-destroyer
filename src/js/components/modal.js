export default {
	template: `
		<div class="modal__container is-active">
			<div class="modal__background" @click="handleCloseRequested"></div>
			<div class="modal" tabindex="0" ref="modal">
				<header class="modal__header">
					<p class="modal__title">
						{{ title }}
					</p>
					<md-button class="md-icon-button" @click.native="handleCloseRequested">
						<md-icon>close</md-icon>
					</md-button>
				</header>
				
				<section class="modal__body">
					<slot name="body"></slot>
				</section>
				
				<footer class="modal__footer">
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