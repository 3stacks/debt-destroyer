import * as React from 'react';
import { IRepaymentSchedule } from '../utils';
import formatDate from 'date-fns/format';
import addMonths from 'date-fns/add_months';

interface IProps {
	debtData: IRepaymentSchedule;
}

export default class Insights extends React.Component<IProps> {
	render() {
		const { debtData } = this.props;
		return (
			<dl>
				<dt>Pay off date</dt>
				<dd>
					{formatDate(
						addMonths(
							new Date(),
							debtData.months[debtData.months.length - 1].month
						),
						'MMM, YYYY'
					)}
				</dd>
				<dt>Total interest paid</dt>
				<dd>
					$
					{debtData.months
						.reduce((acc, month) => {
							return (
								acc +
								Object.values(month.values).reduce(
									(acc, value) => {
										if (!value.interestPaid) {
											return acc;
										}

										return acc + value.interestPaid;
									},
									0
								)
							);
						}, 0)
						.toFixed(2)}
				</dd>
			</dl>
		);
	}
}
