import * as React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';

import Chat from '../pages/Chat';
import SignUp from './../pages/SignUp';

export default (
    <Switch>
        <Route path="/conversation/:id" component={Chat}/>
        <Route path="/signup" component={SignUp}/>
        <Redirect from="/" to="/signup"/>
    </Switch>
);