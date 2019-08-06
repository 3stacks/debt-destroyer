import React from 'react';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button/Button';
import Dialog from '@material-ui/core/Dialog/Dialog';
import { IDialogProps } from '../@types';

export default function SnowballDialog({
	isOpen,
	onCloseRequested
}: IDialogProps) {
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
				Snowball method sorts debts by{' '}
				<em>lowest to highest balance</em>
			</DialogContent>
			<DialogContent>
				Avalanche (or Stack) method sorts debts by{' '}
				<em>highest to lowest interest rate</em>
			</DialogContent>
			<DialogContent>
				Avalanche is technically the most cost-effective method because
				you end up paying less interest overall. This isn't as much of
				an issue if all of your debts have low interest rates or if
				you're going to be paying them off quickly
			</DialogContent>
			<DialogContent>
				While Snowball isn't the most cost-effective method, the
				psychological benefits of closing off accounts are
				well-documented and for most people, this is the best way to
				keep motivated and focused on your goals (hence, the snowball
				effect).
			</DialogContent>
			<DialogContent>
				Snowball was popularised by Dave Ramsey and the Harvard Business
				Review has recently noted that the Snowball method is the best
				strategy for paying off card debt. You can read that article
				here:{' '}
				<a href="https://hbr.org/2016/12/research-the-best-strategy-for-paying-off-credit-card-debt">
					https://hbr.org/2016/12/research-the-best-strategy-for-paying-off-credit-card-debt
				</a>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCloseRequested} color="primary">
					OK
				</Button>
			</DialogActions>
		</Dialog>
	);
}
