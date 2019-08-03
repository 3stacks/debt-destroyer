import Component from './debt-table';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
	root: {
		marginBottom: 24,
		overflowX: 'auto'
	}
});

// @ts-ignore
export default withStyles(styles)(Component);
