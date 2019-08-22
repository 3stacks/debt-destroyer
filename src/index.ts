import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import './index.css';

if (window.navigator.doNotTrack) {
	(window as any).mixpanel.opt_out_tracking();
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));
