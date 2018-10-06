import * as React from 'react';
import {} from 'react-router-dom';
import SDK from '../../services/sdk';
// @ts-ignore
import ReactPhoneInput from 'react-phone-input-2';
import Snackbar from '@material-ui/core/Snackbar';

import './style.css';
import {Refresh} from "@material-ui/icons";
import {C_ERR, C_ERR_ITEM} from "../../services/sdk/const";
import RiverLogo from '../../components/RiverLogo';

interface IProps {
    match?: any;
    location?: any;
    history?: any;
}

interface IState {
    anchorEl: any;
    code: string;
    fName: string;
    lName: string;
    loading: boolean;
    phone?: string;
    phoneHash?: string;
    snackOpen: boolean;
    snackText: string;
    step: string;
    tries: number;
}

class SignUp extends React.Component<IProps, IState> {
    private sdk: SDK;

    constructor(props: IProps) {
        super(props);
        this.state = {
            anchorEl: null,
            code: '',
            fName: '',
            lName: '',
            loading: false,
            phone: '',
            phoneHash: '',
            snackOpen: false,
            snackText: '',
            step: 'phone',
            tries: 0,
        };
        this.sdk = SDK.getInstance();
    }

    public componentDidMount() {
        window.addEventListener('wasmInit', this.wasmInitHandler);
        window.addEventListener('wsOpen', this.wsOpenHandler);
        this.sdk.loadConnInfo();
        if (this.sdk.getConnInfo().AuthID === '0') {
            this.props.history.push('/loading');
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('wasmInit', this.wasmInitHandler);
        window.removeEventListener('wsOpen', this.wsOpenHandler);
    }

    public render() {
        // const {anchorEl} = this.state;
        // const open = Boolean(anchorEl);
        const {step} = this.state;
        return (
            <div className="limiter">
                <div className="container-login100">
                    <div className="top-logo">
                        <RiverLogo height={110} width={100}/>
                    </div>
                    <div className="top-title">Sign in to River</div>
                    <div className="top-desc">
                        {step === 'phone' && <span>Please enter your phone number</span>}
                        {step === 'code' && <span>Please enter the code sent to your number</span>}
                        {step === 'register' && <span>Please fill in your contact info</span>}
                    </div>
                    <div className="wrap-login100 p-t-50 p-b-90">
                        <div className="login100-form river-form flex-sb flex-w">
                            <ReactPhoneInput defaultCountry={'ir'} value={this.state.phone} inputClass="f-phone"
                                             disabled={this.state.loading || step === 'code'}
                                             onChange={this.handleOnChange} onKeyDown={this.sendCodeKeyDown}/>
                            {(this.state.tries > 0 && (step === 'code' || step === 'register')) &&
                            <div className="try-another-phone" onClick={this.tryAnotherPhone}>
                                <Refresh/>
                                <label>
                                    Try another phone
                                </label>
                            </div>}
                            {step === 'code' && <div className="wrap-input100 validate-input m-b-16">
                                <input className="input100 code f-code" type="text" placeholder="____"
                                       value={this.state.code} onChange={this.codeOnChange}
                                       onKeyDown={this.confirmKeyDown}/>
                            </div>}
                            {step === 'register' &&
                            <div className="wrap-input100 validate-input m-b-16">
                                <input className="input100 f-fname" type="text" placeholder="First Name"
                                       autoComplete="off" onKeyDown={this.registerKeyDown}
                                       value={this.state.fName} onChange={this.fNameOnChange}/>
                                <span className="focus-input100"/>
                            </div>}
                            {step === 'register' &&
                            <div className="wrap-input100 validate-input m-b-16">
                                <input className="input100 f-lname" type="text" placeholder="Last Name"
                                       autoComplete="off" onKeyDown={this.registerKeyDown}
                                       value={this.state.lName} onChange={this.lNameOnChange}/>
                                <span className="focus-input100"/>
                            </div>}
                            <div className="container-login100-form-btn m-t-17">
                                {step === 'phone' &&
                                <button className="login100-form-btn" onClick={this.sendCode}
                                        disabled={this.state.loading}>
                                    Send Code
                                </button>}
                                {step === 'code' &&
                                <button className="login100-form-btn" onClick={this.confirmCode}
                                        disabled={this.state.loading}>
                                    Confirm Code
                                </button>}
                                {step === 'register' &&
                                <button className="login100-form-btn" onClick={this.register}
                                        disabled={this.state.loading}>
                                    Register
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>
                <Snackbar
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    open={this.state.snackOpen}
                    onClose={this.handleCloseSnack}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    autoHideDuration={6000}
                    message={<span id="message-id">{this.state.snackText}</span>}
                />
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
        this.setState({
            loading: true,
        });
        this.sdk.sendCode(this.state.phone).then((data) => {
            this.setState({
                loading: false,
                phone: '+' + data.phone,
                phoneHash: data.phonecodehash,
                step: 'code',
            }, () => {
                this.focus('f-code');
            });
        }).catch(() => {
            this.setState({
                loading: false,
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
        const {phone, phoneHash, code} = this.state;
        if (!phone || !phoneHash || code.length < 4) {
            return;
        }
        this.setState({
            loading: true,
        });
        this.sdk.login(phone.slice(1), code, phoneHash).then((res) => {
            const info = this.sdk.loadConnInfo();
            info.UserID = res.user.id;
            info.FirstName = res.user.firstname;
            info.LastName = res.user.lastname;
            info.Phone = this.state.phone;
            this.sdk.setConnInfo(info);
            this.setState({
                loading: false,
                tries: this.state.tries + 1,
            });
            this.props.history.push('/conversation/null');
            this.dispatchWSOpenEvent();
        }).catch((err) => {
            window.console.log(err);
            this.setState({
                loading: false,
                tries: this.state.tries + 1,
            });
            if (err.code === C_ERR.ERR_CODE_INVALID && err.items === C_ERR_ITEM.ERR_ITEM_PHONE_CODE) {
                this.setState({
                    snackOpen: true,
                    snackText: 'Code is incorrect!',
                });
                return;
            }
            if (err.code === C_ERR.ERR_CODE_UNAVAILABLE && err.items === C_ERR_ITEM.ERR_ITEM_PHONE) {
                this.setState({
                    fName: '',
                    lName: '',
                    step: 'register',
                }, () => {
                    this.focus('f-fname');
                });
                return;
            }
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
            phone: '+98',
            phoneHash: '',
            step: 'phone',
            tries: 0,
        }, () => {
            this.focus('f-phone');
        });
    }

    private handleCloseSnack = () => {
        this.setState({
            snackOpen: false,
        });
    }

    private fNameOnChange = (e: any) => {
        this.setState({
            fName: e.target.value,
        });
    }

    private lNameOnChange = (e: any) => {
        this.setState({
            lName: e.target.value,
        });
    }

    private register = () => {
        const {phone, phoneHash, code, fName, lName} = this.state;
        if (!phone || !phoneHash || code.length < 4) {
            return;
        }
        this.setState({
            loading: true,
        });
        this.sdk.register(phone, code, phoneHash, fName, lName).then((res) => {
            const info = this.sdk.loadConnInfo();
            info.UserID = res.user.id;
            info.FirstName = res.user.firstname;
            info.LastName = res.user.lastname;
            info.Phone = this.state.phone;
            this.sdk.setConnInfo(info);
            this.setState({
                loading: false,
                tries: this.state.tries + 1,
            });
            this.props.history.push('/conversation/null');
            this.dispatchWSOpenEvent();
        }).catch((err) => {
            this.setState({
                loading: false,
                tries: this.state.tries + 1,
            });
            if (err.code === C_ERR.ERR_CODE_INVALID && err.items === C_ERR_ITEM.ERR_ITEM_PHONE_CODE) {
                this.setState({
                    snackOpen: true,
                    snackText: 'Code is incorrect!',
                });
                return;
            }
            this.setState({
                snackOpen: true,
                snackText: `Error! Code:${err.code} Items${err.items}`,
            });
        });
    }

    private registerKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            this.register();
        }
    }

    private focus(className: string) {
        const elem: any = document.querySelector('.' + className);
        if (elem) {
            elem.focus();
        }
    }

    private dispatchWSOpenEvent() {
        setTimeout(() => {
            const event = new CustomEvent('wsOpen');
            window.dispatchEvent(event);
        }, 100);
    }

    private wasmInitHandler = () => {
        if (parseInt(this.sdk.getConnInfo().AuthID, 10) === 0) {
            this.props.history.push('/loading');
        }
    }

    private wsOpenHandler = () => {
        if ((this.sdk.getConnInfo().UserID || 0) > 0) {
            this.sdk.recall(0).then(() => {
                this.props.history.push('/conversation/null');
                return;
            }).catch((err) => {
                window.console.log(err);
            });
        }
        this.focus('f-phone');
    }
}

export default SignUp;