import * as React from 'react';
import './App.css';
import Routes from './app/routes';

class App extends React.Component {

    public componentDidMount() {
        // @ts-ignore
        if (window.Notification) {
            Notification.requestPermission();
        }
    }

    public render() {
        return (
            <div className="App">
                {Routes}
            </div>
        );
    }
}

export default App;
