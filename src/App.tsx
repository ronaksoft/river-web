import * as React from 'react';
import './App.css';
import Routes from './app/routes';
import Go from './bin/go_wasm_exec';

class App extends React.Component {
    public componentDidMount() {
        const go = new Go();
        const mod = this.fetchAndInstantiate("./bin/wasm", go.importObject);
        mod.then((instance) => {
            go.run(instance);
        }).catch((err) => {
            window.console.log(err);
        });
    }

    public render() {
        return (
            <div className="App">
                {Routes}
            </div>
        );
    }

    private fetchAndInstantiate(url: string, importObject: any) {
        return fetch(url).then(response => {
                return response.arrayBuffer();
            }
        ).then(bytes =>
            WebAssembly.instantiate(bytes, importObject)
        ).then(results =>
            results.instance
        );
    }
}

export default App;
