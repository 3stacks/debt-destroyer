import Component from './app';
import withStyles from '@material-ui/core/styles/withStyles';

const classes = theme => ({
	tabs: {
		padding: 24
	},
	accoutrements: {
		marginBottom: 24,

		'& fieldset': {
			marginRight: 24
		}
	}
});

export default withStyles(classes)(Component);
