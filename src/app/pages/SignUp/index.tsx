import * as React from 'react';
import SDK from '../../services/sdk';
// @ts-ignore
import ReactPhoneInput from 'react-phone-input-2';

import './style.css';

interface IProps {
    match?: any;
    location?: any;
}

interface IState {
    anchorEl: any;
    confirmCode: boolean;
    phone: string;
}

class Chat extends React.Component<IProps, IState> {
    private sdk: SDK;

    constructor(props: IProps) {
        super(props);
        this.state = {
            anchorEl: null,
            confirmCode: false,
            phone: '',
        };
        this.sdk = SDK.getInstance();
        window.console.log(this.sdk);
    }

    public componentWillReceiveProps(newProps: IProps) {
        window.console.log(newProps);
    }

    public componentDidMount() {
        window.console.log("wrfwr");
    }

    public render() {
        // const {anchorEl} = this.state;
        // const open = Boolean(anchorEl);
        return (
            <div className="limiter">
                <div className="container-login100">
                    <div className="wrap-login100 p-t-50 p-b-90">
                        <div className="login100-form validate-form flex-sb flex-w">
                            <ReactPhoneInput defaultCountry={'ir'} value={this.state.phone}
                                             onChange={this.handleOnChange} onKeyDown={this.sendCodeKeyDown}/>
                            {/*<div className="wrap-input100 validate-input m-b-16">*/}
                            {/*<input className="input100" type="text" placeholder="Username"/>*/}
                            {/*<span className="focus-input100"/>*/}
                            {/*</div>*/}
                            {this.state.confirmCode && <div className="wrap-input100 validate-input m-b-16">
                                <input className="input100" type="text" placeholder="Code"/>
                            </div>}
                            <div className="container-login100-form-btn m-t-17">
                                {!this.state.confirmCode &&
                                <button className="login100-form-btn" onClick={this.sendCode}>
                                    Send Code
                                </button>}
                                {this.state.confirmCode &&
                                <button className="login100-form-btn" onClick={this.confirmCode}>
                                    Confirm Code
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private handleOnChange = (value: any) => {
        this.setState({
            phone: value,
        });
    }

    private sendCode = () => {
        this.sdk.sendCode(this.state.phone).then((data) => {
            window.console.log(data);
            this.setState({
                confirmCode: true,
            });
        });
    }

    private sendCodeKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            this.sendCode();
        }
    }

    private confirmCode = () => {
        window.console.log('erer');
    }
}

export default Chat;