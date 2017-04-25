export default {
	template: `
		<canvas :id="chartId" ref="canvas" data-chart-data="realData.length"></canvas>
	`,
	beforeDestroy() {
		this._chartReference.destroy();
	},
	mounted() {
		new Chart(this.$refs.canvas, {
			type: this.$props.chartType,
			data: this.$data.realData,
			options: this.$props.chartOptions
		});
	},
	beforeUpdate() {
		console.log('hello');
		// this._chartReference.update();
	},
	updated() {
		console.log('hello');
	},
	data() {
		return {
			realData: this.$props.chartData
		}
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
			realData: (newValue) => {
				console.log(Object.keys(newValue));
			}
	}
}