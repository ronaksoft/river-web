import * as React from 'react';
import SDK from '../../services/sdk';
// @ts-ignore
import {Circle} from 'rc-progress';
import './style.css';
import RiverLogo from '../../components/RiverLogo';

interface IProps {
    match?: any;
    location?: any;
    history?: any;
}

interface IState {
    limit: number;
    msg: string;
    percent: number;
}

class Loading extends React.Component<IProps, IState> {
    private sdk: SDK;
    private tm: any = null;

    constructor(props: IProps) {
        super(props);
        this.state = {
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
            this.props.history.push('/conversation/null');
        } else if (this.sdk.getConnInfo().AuthID !== '0') {
            this.props.history.push('/signup');
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('wasmInit', this.wasmInitHandler);
        window.removeEventListener('authProgress', this.authProgressHandler);
        window.removeEventListener('fnStarted', this.fnStartedHandler);
    }

    public render() {
        const {percent, msg} = this.state;
        return (
            <div className="loading-page">
                <div className="loading-area">
                    <Circle percent={percent} strokeWidth="1" strokeColor="#008c3d"/>
                    <div className="loading-text">
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
                this.props.history.push('/conversation/null');
            } else {
                this.props.history.push('/signup');
            }
        } else {
            this.setState({
                msg: `It took ${duration} seconds to secure your connection`,
            });
            setTimeout(() => {
                if ((this.sdk.getConnInfo().UserID || 0) > 0) {
                    this.props.history.push('/conversation/null');
                } else {
                    this.props.history.push('/signup');
                }
            }, 3000);
        }
    }
}

export default Loading;