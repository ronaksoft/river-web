import * as React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';

import Chat from '../pages/Chat';
import SignUp from './../pages/SignUp';
import Loading from './../pages/Loading';

export default (
    <Switch>
        <Route path="/chat/:id" component={Chat}/>
        <Route path="/signup" component={SignUp}/>
        <Route path="/loading" component={Loading}/>
        <Redirect from="/" to="/loading"/>
    </Switch>
);
