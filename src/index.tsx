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

export const C_VERSION = '1.0.74';
export const C_ELECTRON_VERSIONS = ['11.2.4'];
export const C_APP_VERSION = '0.31.0';
export const isProd = (!process || !process.env || process.env.NODE_ENV !== 'development');

const App = React.lazy(() => import('./App'));

let appRef: any;
const appRefHandler = (ref: any) => {
    appRef = ref;
};

NProgress.configure({
    barSelector: '[role="loading-bar"]',
    easing: 'linear',
    showSpinner: false,
    speed: 700,
    template: '<div class="loading-bar" role="loading-bar"></div>',
    trickleSpeed: 100,
});

NProgress.inc(0.2);

const Loading = () => {
    useEffect(() => {
        NProgress.start();
        NProgress.inc(0.3);

        return () => {
            NProgress.set(1);
            NProgress.done();
            NProgress.remove();
        };
    });

    return <div className="lazy-loading-container">
        <div className="version">v{C_VERSION}</div>
    </div>;
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

