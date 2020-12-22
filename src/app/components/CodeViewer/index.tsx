/*
    Creation Time: 2020 - April - 04
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

/* eslint import/no-webpack-loader-syntax: off */
import * as React from 'react';
// @ts-ignore
import HighlightWorker from "worker-loader?filename=hls.js!./worker";

import './style.scss';

interface IProps {
    onDone?: () => void;
    snippet: string;
}

interface IState {
    className?: string;
    html: string;
}

class CodeViewer extends React.Component<IProps, IState> {
    private worker: Worker | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            html: '',
        };
    }

    public componentDidMount() {
        this.worker = new HighlightWorker();
        this.worker.postMessage({cmd: 'compile', payload: this.props.snippet});
        this.worker.onmessage = (e: any) => {
            const data: { cmd: string, payload: any } = e.data;
            if (data.cmd === 'highlight') {
                this.setState({
                    html: data.payload,
                }, () => {
                    if (this.props.onDone) {
                        this.props.onDone();
                    }
                });
                this.worker = undefined;
            }
        };
    }

    public componentWillUnmount() {
        if (this.worker) {
            this.worker.terminate();
        }
    }

    public render() {
        const {snippet} = this.props;
        const {html} = this.state;
        if (html.length > 0) {
            return (
                <code className="code-viewer" dangerouslySetInnerHTML={{__html: html}}/>
            );
        } else {
            return (
                <code className="code-viewer">{snippet}</code>
            );
        }
    }

}

export default CodeViewer;
