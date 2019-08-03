import Component from './app';
import withStyles from '@material-ui/core/styles/withStyles';
import { FlexDirectionProperty } from 'csstype';

const classes = theme => ({
	tabs: {
		padding: 24
	},
	aboutButton: {
		height: 48,
		width: 64,
		padding: 0,
		color: 'white'
	},
	appBar: {
		height: 64,
		display: 'flex',
		flexDirection: 'row' as FlexDirectionProperty,
		justifyContent: 'center',
		alignItems: 'center',

		'& h1': {
			margin: '0 auto'
		}
	},
	accoutrements: {
		display: 'flex',
		justifyContent: 'space-between',
		marginBottom: 24,

		'& fieldset': {
			marginRight: 24
		}
	}
});

export default withStyles(classes)(Component);
