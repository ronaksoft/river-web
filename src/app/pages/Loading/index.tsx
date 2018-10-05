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
    percent: number;
}

class Loading extends React.Component<IProps, IState> {
    private sdk: SDK;
    private tm: any = null;

    constructor(props: IProps) {
        super(props);
        this.state = {
            limit: 0,
            percent: 0,
        };
        this.sdk = SDK.getInstance();
    }

    public componentDidMount() {
        window.addEventListener('wasmInit', () => {
            this.sdk.recall(0);
        });
        window.addEventListener('authProgress', (event: any) => {
            const percent = event.detail.progress;
            this.setState({
                limit: percent,
            }, () => {
                this.increase();
                if (percent >= 100) {
                    if ((this.sdk.getConnInfo().UserID || 0) > 0) {
                        this.props.history.push('/conversation/null');
                    } else {
                        this.props.history.push('/signup');
                    }
                }
            });
        });
    }

    public render() {
        const {percent} = this.state;
        return (
            <div className="loading-page">
                <div className="loading-area">
                    <Circle percent={percent} strokeWidth="4" strokeColor="#D3D3D3" />
                    <div className="loading-text">Securing connection<br/> Please wait</div>
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
        this.setState({ percent });
        this.tm = setTimeout(this.increase, 10);
    }
}

export default Loading;