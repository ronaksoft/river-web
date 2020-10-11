/*
    Creation Time: 2018 - Aug - 19
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import Chat from '../pages/Chat';
import SignUp from './../pages/SignUp';
import Loading from './../pages/Loading';
import Test from "../pages/Test";
import RTC from "../pages/RTC";

/* tslint:disable:jsx-no-lambda */
export default (
    <Switch>
        <Route path="/chat/:tid/:id/:mid?" component={(props: any) => (
            <Chat {...props}/>
        )}/>
        <Route path="/signup/:mode" component={(props: any) => (
            <SignUp {...props}/>
        )}/>
        <Route path="/loading" component={(props: any) => (
            <Loading {...props}/>
        )}/>
        <Route path="/test" component={(props: any) => (
            <Test {...props}/>
        )}/>
        <Route path="/rtc" component={(props: any) => (
            <RTC {...props}/>
        )}/>
        <Redirect from="/" to="/loading"/>
    </Switch>
);
