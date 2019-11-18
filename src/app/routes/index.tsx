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
import Test from './../pages/Test';

export default (
    <Switch>
        <Route path="/chat/:id/:mid?" component={Chat}/>
        <Route path="/signup/:mode" component={SignUp}/>
        <Route path="/loading" component={Loading}/>
        <Route path="/test" component={Test}/>
        <Redirect from="/" to="/loading"/>
    </Switch>
);
