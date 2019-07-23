/*
    Creation Time: 2018 - Oct - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import SDK from '../../services/sdk';
import {Circle} from 'rc-progress';
import RiverLogo from '../../components/RiverLogo';
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import {CloseRounded} from "@material-ui/icons";
import IframeService, {C_IFRAME_SUBJECT} from "../../services/iframe";

import './style.css';
import {Link} from "react-router-dom";

interface IProps {
    match?: any;
    location?: any;
    history?: any;
}

interface IState {
    limit: number;
    iframeActive: boolean;
    msg: string;
    percent: number;
}

class Loading extends React.Component<IProps, IState> {
    private sdk: SDK;
    private tm: any = null;
    private iframeService: IframeService;
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);

        this.iframeService = IframeService.getInstance();
        this.state = {
            iframeActive: this.iframeService.isActive(),
            limit: 0,
            msg: '',
            percent: 0,
        };
        this.sdk = SDK.getInstance();
    }

    public componentDidMount() {
        window.addEventListener('wasmInit', this.wasmInitHandler);
        window.addEventListener('authProgress', this.authProgressHandler);
        window.addEventListener('fnStarted', this.fnStartedHandler);
        this.sdk.loadConnInfo();
        if ((this.sdk.getConnInfo().UserID || 0) > 0) {
            this.props.history.push('/chat/null');
        } else if (this.sdk.getConnInfo().AuthID !== '0') {
            this.props.history.push('/signup/null');
        }

        if (!this.state.iframeActive) {
            this.eventReferences.push(this.iframeService.listen(C_IFRAME_SUBJECT.IsLoaded, (e) => {
                this.setState({
                    iframeActive: true,
                });
            }));
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('wasmInit', this.wasmInitHandler);
        window.removeEventListener('authProgress', this.authProgressHandler);
        window.removeEventListener('fnStarted', this.fnStartedHandler);
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {percent, msg, iframeActive} = this.state;
        return (
            <div className="loading-page">
                {iframeActive && <span className="close-btn">
                                    <Tooltip
                                        title="close"
                                        placement="bottom"
                                        onClick={this.closeIframeHandler}
                                    >
                                        <IconButton>
                                            <CloseRounded/>
                                        </IconButton>
                                    </Tooltip>
                                </span>}
                <div className="loading-area">
                    <Circle percent={percent} strokeWidth={1} strokeColor="#008c3d"/>
                    <div className="loading-text">
                        <Link to={'/signup/workspace'}>Change Workspace</Link><br/>
                        Securing connection<br/> Please wait <br/>
                        {msg === '' && <span className="info">It might take up to 60 seconds!</span>}
                        {msg !== '' && <span className="info">{msg}</span>}
                    </div>
                    <div className="logo">
                        <RiverLogo height={64} width={64}/>
                    </div>
                </div>
            </div>
        );
    }

    private increase = () => {
        clearTimeout(this.tm);
        const percent = this.state.percent + 1;
        if (percent >= this.state.limit) {
            clearTimeout(this.tm);
            return;
        }
        this.setState({percent});
        this.tm = setTimeout(this.increase, 10);
    }

    private wasmInitHandler = () => {
        // this.sdk.recall('0');
    }

    private authProgressHandler = (event: any) => {
        const percent = event.detail.progress;
        this.setState({
            limit: percent + 5,
        }, () => {
            this.increase();
        });
    }

    private fnStartedHandler = (event: any) => {
        const duration = event.detail.duration;
        if (duration === -1) {
            if ((this.sdk.getConnInfo().UserID || 0) > 0) {
                this.props.history.push('/chat/null');
            } else {
                this.props.history.push('/signup/null');
            }
        } else {
            this.setState({
                msg: `It took ${duration} seconds to secure your connection`,
            });
            setTimeout(() => {
                if ((this.sdk.getConnInfo().UserID || 0) > 0) {
                    this.props.history.push('/chat/null');
                } else {
                    this.props.history.push('/signup/null');
                }
            }, 3000);
        }
    }

    private closeIframeHandler = () => {
        this.iframeService.close();
    }
}

export default Loading;
