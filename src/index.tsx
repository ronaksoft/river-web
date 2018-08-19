import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {HashRouter} from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render((
        <HashRouter>
            <App/>
        </HashRouter>
    ),
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
