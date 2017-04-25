export default {
	template: `
		<canvas :id="chartId" ref="canvas"></canvas>
	`,
	beforeDestroy() {
		this._chartReference.destroy();
	},
	mounted() {
		console.log(this.$data);

		new Chart(this.$refs.canvas, {
			type: this.$data.chartType,
			data: this.$data.rawChartData,
			options: this.$props.chartOptions
		});
	},
	beforeUpdate() {
		console.log('hello');
		this._chartReference.update();
	},
	updated() {
		console.log('hello');
	},
	data() {
		console.log(this.$props);
		return {
			chartType: this.$props.chartData.chart.type,
			rawChartData: this.$props.chartData.chart.data,
			chartOptions: this.$props.chartData.chart.options
		}
	},
	props: {
		chartId: {
			type: String,
			required: true
		},
		chartData: {
			type: Object,
			required: true
		}
	}
}