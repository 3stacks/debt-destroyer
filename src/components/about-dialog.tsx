import React from 'react';
import Link from '@material-ui/core/Link';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button/Button';
import Dialog from '@material-ui/core/Dialog/Dialog';
import { IDialogProps } from '../@types';

export default function({ isOpen, onCloseRequested }: IDialogProps) {
	return (
		<Dialog
			open={isOpen}
			onClose={onCloseRequested}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">
				About Debt Destroyer
			</DialogTitle>
			<DialogContent>
				<p>
					Debt Destroyer was created by{' '}
					<a href="https://lukeboyle.com">Luke Boyle</a>. Many people
					have a hard time seeing a light at the end of their debt
					tunnel. This app gives accurate visualisations to show
					people that they can be debt free with their current budget.
					To report an issue, visit the Github repo at{' '}
					<Link
						rel="noreferrer noopener"
						target="_blank"
						href="https://github.com/3stacks/debt-destroyer"
					>
						https://github.com/3stacks/debt-destroyer
					</Link>
					.
				</p>
				<p>
					If you are not sure where or how to get started,{' '}
					<Link
						target="_blank"
						rel="noreferrer noopener"
						href="https://www.amazon.com/Dave-Ramsey/e/B000APQ02W%3Fref=dbs_a_mng_rwt_scns_share"
					>
						Dave Ramsey
					</Link>{' '}
					has an extremely comprehensive library of books to help
					beginners get started (consider the Total Money Makeover as
					a starting point).
				</p>
				<p>
					If you are having trouble finding extra room in your budget
					to contribute more to crushing your debts, think about any
					unnecessary vices you might be able to cut out. Keep in
					mind, it's probably not your 1-a-day latte habit keeping you
					in debt. The bigger culprits are larger, hidden expenses
					like unused gym memberships, smoking habits, a plethora of
					streaming service subscriptions. See how these vices are
					impacting your budget at{' '}
					<Link
						href="https://vices.me"
						target="_blank"
						rel="noreferrer noopener"
					>
						https://vices.me
					</Link>
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
