/*
    Creation Time: 2018 - Aug - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import {HashRouter} from 'react-router-dom';
import * as serviceWorker from "./serviceWorker";

import './index.css';

let appRef: App;
const appRefHandler = (ref: any) => {
    appRef = ref;
};

ReactDOM.render((
        <HashRouter>
            <App ref={appRefHandler}/>
        </HashRouter>
    ),
    document.getElementById('root') as HTMLElement,
);

const onUpdate = (registration: ServiceWorkerRegistration) => {
    if (registration.waiting) {
        registration.waiting.postMessage({type: 'SKIP_WAITING'});
    }
    if (appRef) {
        appRef.updateDialog();
    }
};

const onSuccess = () => {
    if (appRef) {
        appRef.onSuccess();
    }
};

serviceWorker.register({
    onSuccess,
    onUpdate,
});

