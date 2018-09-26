import * as React from 'react';
import SDK from '../../services/sdk';
// @ts-ignore
import ReactPhoneInput from 'react-phone-input-2';

import './style.css';
import {Refresh} from "@material-ui/icons";

interface IProps {
    match?: any;
    location?: any;
}

interface IState {
    anchorEl: any;
    code: string;
    confirmCode: boolean;
    phone?: string;
    phoneHash?: string;
    tries: number;
}

class Chat extends React.Component<IProps, IState> {
    private sdk: SDK;

    constructor(props: IProps) {
        super(props);
        this.state = {
            anchorEl: null,
            code: '',
            confirmCode: false,
            phone: '',
            phoneHash: '',
            tries: 0,
        };
        this.sdk = SDK.getInstance();
        window.console.log(this.sdk);
    }

    public componentWillReceiveProps(newProps: IProps) {
        window.console.log(newProps);
    }

    public componentDidMount() {
        window.addEventListener('wasm_init', () => {
            const info = this.sdk.getConnInfo();
            if (info.UserID) {
                this.sdk.recall(info.UserID).then((data) => {
                    window.console.log(data);
                });
            }
        });
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
                                <input className="input100 code" type="text" placeholder="____"
                                       value={this.state.code} onChange={this.codeOnChange}
                                       onKeyDown={this.confirmKeyDown}/>
                            </div>}
                            {(this.state.tries > 0 && this.state.confirmCode) &&
                            <div className="try-another-phone" onClick={this.tryAnotherPhone}>
                                <Refresh/>
                                <label>
                                    Try another phone
                                </label>
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
        if (!this.state.phone) {
            return;
        }
        this.sdk.sendCode(this.state.phone).then((data) => {
            window.console.log(data);
            this.setState({
                confirmCode: true,
                phone: '+' + data.phone,
                phoneHash: data.phonecodehash,
            });
        });
    }

    private sendCodeKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            this.sendCode();
        }
    }

    private modifyCode(str: string): string {
        const s = '____'.split('');
        const nums = str.match(/\d+/g);
        if (nums) {
            nums.join('').split('').slice(0, 4).forEach((val, key) => {
                s[key] = val;
            });
        }
        return s.join('');
    }

    private codeOnChange = (e: any) => {
        this.setState({
            code: this.modifyCode(e.target.value),
        });
    }

    private confirmCode = () => {
        if (!this.state.phone || !this.state.phoneHash || this.state.code.length < 4) {
            return;
        }
        this.sdk.login(this.state.phone.slice(1), this.state.code, this.state.phoneHash).then((res) => {
            const info = this.sdk.getConnInfo();
            info.UserID = res.user.id;
            info.FirstName = res.user.firstname;
            info.LastName = res.user.lastname;
            info.Phone = this.state.phone;
            this.sdk.setConnInfo(info);
            this.setState({
                tries: this.state.tries + 1,
            });
        }).catch((err) => {
            window.console.log(err);
            this.setState({
                tries: this.state.tries + 1,
            });
        });
    }

    private confirmKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            this.confirmCode();
        }
    }

    private tryAnotherPhone = () => {
        this.setState({
            code: '____',
            confirmCode: false,
            phone: '+98',
            phoneHash: '',
            tries: 0,
        });
    }
}

export default Chat;