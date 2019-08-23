import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import mixpanel from './utils/mixpanel';
import * as serviceWorker from './sw';
import './index.css';

if (window.navigator.doNotTrack) {
	mixpanel.opt_out_tracking();
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));

serviceWorker.register();
