import * as React from 'react';
import './App.css';

// import logo from './logo.svg';
// import Orderable from "./app/components/Orderable";
// import OptimizedList from "./app/components/OptimizedList";
import Chat from "./app/components/Chat"
// const getRandText = () => {
//     const rnd = Math.random() * 100;
//     let text = '';
//     for (let i = 0; i < rnd; i++) {
//         text += "A ";
//     }
//     return text;
// };
// const list: any[] = [];
// for (let i = 0; i < 1000; i++) {
//     list.push({value: getRandText()})
// }

class App extends React.Component {
    public render() {
        return (
            <div className="App">
                {/*<header className="App-header">*/}
                    {/*<img src={logo} className="App-logo" alt="logo"/>*/}
                    {/*<h1 className="App-title">Welcome to React</h1>*/}
                {/*</header>*/}
                {/*<p className="App-intro">*/}
                    {/*To get started, edit <code>src/App.tsx</code> and save to reload.*/}
                {/*</p>*/}
                {/*<div className="kk-center">*/}
                    {/*<Orderable items={list}/>*/}
                {/*</div>*/}
                {/*<div className="kk-center">*/}
                    {/*<OptimizedList items={list}/>*/}
                {/*</div>*/}
                <Chat/>
            </div>
        );
    }
}

export default App;
