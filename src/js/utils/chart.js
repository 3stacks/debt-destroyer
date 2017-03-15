import Chart from 'chart.js';

export function createChart(chartId, paymentGraph, labels) {
	const canvas = document.createElement('canvas');
	const id = chartId;
	canvas.id = id;
	document.getElementById('chart_container').appendChild(canvas);
	return new Chart(id, {
		type: 'bar',
		data: {
			labels: labels,
			datasets: [
				{
					label: 'Amount Paid',
					type: 'line',
					yAxisId: 'amount_paid',
					borderColor: '#e74c3c',
					backgroundColor: '#e74c3c',
					fill: false,
					data: Object.values(paymentGraph).map(function(item) {
						return parseInt(item.amountPaid) / 100;
					})
				},
				{
					label: 'Amount Remaining',
					type: 'bar',
					yAxisId: 'amount_left',
					backgroundColor: '#3498db',
					borderColor: '#3498db',
					data: Object.values(paymentGraph).map(function(item) {
						return parseInt(item.amountLeft) / 100;
					})
				}
			],
			borderWidth: 1
		},
		options: {
			title: {
				display: true,
				text: chartId,
				position: 'top'
			},
			legend: {
				position: 'bottom'
			},
			scales: {
				yAxes: [
					{
						stacked: false,
						position: 'left',
						id: 'amount_left'
					},
					{
						stacked: false,
						position: 'right',
						id: 'amount_paid'
					}
				]
			}
		}
	});
}