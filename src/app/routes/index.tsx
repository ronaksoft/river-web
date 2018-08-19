import * as React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';

import Chat from './../components/Chat';

export default (
    <Switch>
        <Route path="/conversation/:id" component={Chat}/>
        <Redirect from="/" to="/conversation/null" />
    </Switch>
);