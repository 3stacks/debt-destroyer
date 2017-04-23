export default {
	template: `
		<canvas :id="chartId" ref="canvas"></canvas>
	`,
	beforeDestroy() {
		this._chartReference.destroy();
	},
	mounted() {
		console.log(this.$props);
		new Chart(this.$refs.canvas, {
			type: this.$props.chartType,
			data: this.$props.chartData,
			options: this.$props.chartOptions
		});
	},
	beforeUpdate() {
		this._chartReference.update();
	},
	props: {
		chartId: {
			type: String,
			required: true
		},
		chartType: {
			type: String,
			required: true
		},
		chartData: {
			type: Object,
			required: true
		},
		chartOptions: {
			type: Object,
			required: true
		}
	},
	watch: {
		chartData: (newValue) => {
			console.log(Object.keys(newValue));
		}
	}
}