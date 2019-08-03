import Component from './app';
import withStyles from '@material-ui/core/styles/withStyles';

const classes = {
	accoutrements: {
		marginBottom: 24,

		'& fieldset': {
			marginRight: 24
		}
	}
};

export default withStyles(classes)(Component);
