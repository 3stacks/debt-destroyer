import Component from './debt-table';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
	root: {
		marginBottom: 24,
		backgroundColor: theme.palette.background.paper
	}
});

export default withStyles(styles)(Component);
