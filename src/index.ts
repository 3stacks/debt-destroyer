import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import * as serviceWorker from './sw';
import './index.css';

ReactDOM.render(React.createElement(App), document.getElementById('root'));

serviceWorker.register();
