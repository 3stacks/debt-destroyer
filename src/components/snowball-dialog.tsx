import React from 'react';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button/Button';
import Dialog from '@material-ui/core/Dialog/Dialog';
import { IDialogProps } from '../@types';
import mixpanel from '../utils/mixpanel';

export default function SnowballDialog({
	isOpen,
	onCloseRequested
}: IDialogProps) {
	mixpanel.track('about dialog opened');

	return (
		<Dialog
			open={isOpen}
			onClose={onCloseRequested}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">
				Debt payoff methods
			</DialogTitle>
			<DialogContent>
				<p>
					Snowball method sorts debts by{' '}
					<em>lowest to highest balance</em>
				</p>
				<p>
					Avalanche (or Stack) method sorts debts by{' '}
					<em>highest to lowest interest rate</em>
				</p>
				<p>
					Avalanche is technically the most cost-effective method
					because you end up paying less interest overall. This isn't
					as much of an issue if all of your debts have low interest
					rates or if you're going to be paying them off quickly
				</p>
				<p>
					While Snowball isn't the most cost-effective method, the
					psychological benefits of closing off accounts are
					well-documented and for most people, this is the best way to
					keep motivated and focused on your goals (hence, the
					snowball effect).
				</p>
				<p>
					Snowball was popularised by Dave Ramsey and the Harvard
					Business Review has recently noted that the Snowball method
					is the best strategy for paying off card debt. You can read
					that article here:{' '}
					<a href="https://hbr.org/2016/12/research-the-best-strategy-for-paying-off-credit-card-debt">
						https://hbr.org/2016/12/research-the-best-strategy-for-paying-off-credit-card-debt
					</a>
				</p>
				<p>
					For more information about these methods, read:{' '}
					<a href="https://www.investopedia.com/articles/personal-finance/080716/debt-avalanche-vs-debt-snowball-which-best-you.asp">
						https://www.investopedia.com/articles/personal-finance/080716/debt-avalanche-vs-debt-snowball-which-best-you.asp
					</a>
				</p>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCloseRequested} color="primary">
					OK
				</Button>
			</DialogActions>
		</Dialog>
	);
}
