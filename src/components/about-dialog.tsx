import React from 'react';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button/Button';
import Dialog from '@material-ui/core/Dialog/Dialog';

export default function({isOpen, onCloseRequested} : {isOpen: boolean, onCloseRequested: () => void}) {
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
				<DialogContentText id="alert-dialog-description">
					Debt Destroyer was created by <a href="https://lukeboyle.com">
					Luke Boyle
				</a>. Many people have a hard time seeing a light
					at the end of their debt tunnel. This app gives
					accurate visualisations to show people that they
					can be debt free with their current budget.

					To report an issue, visit the Github repo at <a
					href="https://github.com/3stacks/debt-destroyer">https://github.com/3stacks/debt-destroyer</a>.
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCloseRequested} color="primary">
					OK
				</Button>
			</DialogActions>
		</Dialog>
	);
}
