import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import './app.css';

class App extends Component {
	state = {

	};

	render() {
		return (
			<Typography variant="body1">
				<AppBar>
					<Typography variant="h5" component="h1" color="inherit">
						Debt Destroyer
					</Typography>
				</AppBar>
				<Dialog
					open={true}
					onClose={this.handleClose}
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
						<Button onClick={this.handleClose} color="primary">
							Disagree
						</Button>
					</DialogActions>
				</Dialog>
			</Typography>
		);
	}
}

export default App;
