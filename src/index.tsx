/*
    Creation Time: 2018 - Aug - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import React, {Suspense, useEffect} from 'react';
import ReactDOM from 'react-dom';
import NProgress from 'nprogress';
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

import './index.css';

const App = React.lazy(() => import('./App'));

let appRef: any;
const appRefHandler = (ref: any) => {
    appRef = ref;
};

NProgress.configure({
    barSelector: '[role="loading-bar"]',
    easing: 'linear',
    showSpinner: false,
    template: '<div class="loading-bar" role="loading-bar"></div>',
    trickleSpeed: 200,
});

const Loading = () => {
    useEffect(() => {
        NProgress.start();
        NProgress.inc(0.2);
        window.console.log('start');

        return () => {
            window.console.log('done');
            NProgress.done();
            NProgress.remove();
        };
    });

    return <div className="lazy-loading-container"/>;
};

ReactDOM.render((
        <Suspense fallback={<Loading/>}>
            <App ref={appRefHandler}/>
        </Suspense>
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

serviceWorkerRegistration.register({
    onSuccess,
    onUpdate,
});

