/*
    Creation Time: 2018 - Sep - 25
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import SDK from '../../services/sdk';
// @ts-ignore
import IntlTelInput from 'react-intl-tel-input';
import Snackbar from '@material-ui/core/Snackbar';
import {Refresh} from '@material-ui/icons';
import {C_ERR, C_ERR_ITEM} from '../../services/sdk/const';
import RiverLogo from '../../components/RiverLogo';
import NotificationService from '../../services/notification';
import IsMobile from '../../services/isMobile';
import {C_VERSION} from '../../components/SettingMenu';

import './tel-input.css';
import './style.css';

const C_CLIENT = `Web:- ${window.navigator.userAgent}`;

interface IProps {
    match?: any;
    location?: any;
    history?: any;
}

interface IState {
    anchorEl: any;
    code: string;
    countdown: number;
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
    private notification: NotificationService;
    private readonly isMobile: boolean = false;
    private logoRef: any = null;
    private countdownInterval: any = null;

    constructor(props: IProps) {
        super(props);
        this.state = {
            anchorEl: null,
            code: '',
            countdown: 60,
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
        this.notification = NotificationService.getInstance();
        this.isMobile = IsMobile.isAny();
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
        clearInterval(this.countdownInterval);
    }

    public render() {
        // const {moreInfoAnchorEl} = this.state;
        // const open = Boolean(moreInfoAnchorEl);
        const {step, countdown} = this.state;
        return (
            <div className="limiter">
                <div className="login-page">
                    <div className="top-logo" ref={this.logoRefHandler}>
                        <RiverLogo height={110} width={100}/>
                        <div className="countdown">
                            <span>{countdown}</span>
                        </div>
                    </div>
                    <div className="top-title">Sign in to River</div>
                    <div className="top-desc">
                        {step === 'phone' && <span>Please enter your phone number</span>}
                        {step === 'code' && <span>Please enter the code sent to your phone</span>}
                        {step === 'register' && <span>Please fill in your contact info</span>}
                    </div>
                    <div className="login-wrapper p-t-50 p-b-90">
                        <div className="login-form river-form flex-sb flex-w">
                            <IntlTelInput preferredCountries={[]} defaultCountry={'ir'} value={this.state.phone}
                                          inputClassName="f-phone" disabled={this.state.loading || step === 'code'}
                                          autoHideDialCode={false} onPhoneNumberChange={this.handleOnChange}
                                          onKeyDown={this.sendCodeKeyDown} nationalMode={false}/>
                            {(this.state.tries > 0 && (step === 'code' || step === 'register')) &&
                            <div className="try-another-phone" onClick={this.tryAnotherPhone}>
                                <Refresh/>
                                <label>
                                    Try another phone
                                </label>
                            </div>}
                            {step === 'code' && countdown !== 0 && <div className="input-wrapper validate-input m-b-16">
                                <input className="input code f-code" type={this.isMobile ? 'number' : 'text'}
                                       value={this.state.code} placeholder="____" onChange={this.codeOnChange}
                                       onKeyDown={this.confirmKeyDown}/>
                            </div>}
                            {step === 'register' &&
                            <div className="input-wrapper validate-input m-b-16">
                                <input className="input f-fname" type="text" placeholder="First Name"
                                       autoComplete="off" onKeyDown={this.registerKeyDown}
                                       value={this.state.fName} onChange={this.fNameOnChange}/>
                                <span className="focus-input"/>
                            </div>}
                            {step === 'register' &&
                            <div className="input-wrapper validate-input m-b-16">
                                <input className="input f-lname" type="text" placeholder="Last Name"
                                       autoComplete="off" onKeyDown={this.registerKeyDown}
                                       value={this.state.lName} onChange={this.lNameOnChange}/>
                                <span className="focus-input"/>
                            </div>}
                            <div className="container-login-form-btn m-t-17">
                                {step === 'phone' &&
                                <button className="login-form-btn" onClick={this.sendCode}
                                        disabled={this.state.loading}>
                                    Send Code
                                </button>}
                                {step === 'code' &&
                                <button className="login-form-btn" onClick={this.confirmCode}
                                        disabled={this.state.loading}>
                                    {countdown === 0 ? 'Resend Code' : 'Confirm Code'}
                                </button>}
                                {step === 'register' &&
                                <button className="login-form-btn" onClick={this.register}
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

    private handleOnChange = (e: any, value: any) => {
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
                this.startCountdown();
            });
        }).catch(() => {
            this.setState({
                loading: false,
            });
        });
    }

    private sendCodeKeyDown = (e: any) => {
        window.console.log(e);
        // if (e.key === 'Enter') {
        //     this.sendCode();
        // }
    }

    private modifyCode(str: string, remove?: boolean): string {
        const s = '____'.split('');
        let nums = str.match(/\d+/g);
        if (nums) {
            nums = nums.join('').split('').slice(0, 4);
            nums.forEach((val, key) => {
                if (remove && nums && nums.length > 0 && nums.length - 1 === key) {
                    s[key] = '_';
                } else {
                    s[key] = val;
                }
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
        const {phone, phoneHash, code, countdown} = this.state;
        if ((!phone || !phoneHash || (code.length < 4 && countdown !== 0))) {
            return;
        }
        this.setState({
            loading: true,
        });
        if (countdown === 0) {
            this.sdk.resendCode(phone.slice(1), phoneHash).then(() => {
                this.focus('f-code');
                this.startCountdown();
                this.setState({
                    loading: false,
                });
            }).catch(() => {
                this.setState({
                    loading: false,
                });
            });
        } else {
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
                this.props.history.push('/chat/null');
                this.dispatchWSOpenEvent();
                this.notification.initToken().then((token) => {
                    this.sdk.registerDevice(token, 0, C_VERSION, C_CLIENT, 'en', '1');
                }).catch(() => {
                    this.sdk.registerDevice('-', 0, C_VERSION, C_CLIENT, 'en', '1');
                });
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
    }

    private confirmKeyDown = (e: any) => {
        if (e.key === 'Backspace') {
            e.stopPropagation();
            e.preventDefault();
            this.setState({
                code: this.modifyCode(this.state.code, true),
            });
        } else if (e.key === 'Enter') {
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
            this.stopCoundown();
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
            this.props.history.push('/chat/null');
            this.dispatchWSOpenEvent();
            this.notification.initToken().then((token) => {
                this.sdk.registerDevice(token, 0, C_VERSION, C_CLIENT, 'en', '1');
            }).catch(() => {
                this.sdk.registerDevice('-', 0, C_VERSION, C_CLIENT, 'en', '1');
            });
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
            this.sdk.recall('0').then(() => {
                this.props.history.push('/chat/null');
                return;
            }).catch((err) => {
                window.console.log(err);
            });
        }
        this.focus('f-phone');
    }

    private logoRefHandler = (ref: any) => {
        this.logoRef = ref;
    }

    private startCountdown() {
        if (!this.logoRef) {
            return;
        }
        this.logoRef.classList.add('a-enable');
        setTimeout(() => {
            this.logoRef.classList.add('c-enable');
        }, 300);
        this.setState({
            countdown: 60,
        });
        clearInterval(this.countdownInterval);
        this.countdownInterval = setInterval(() => {
            const {countdown} = this.state;
            if (countdown > 1) {
                this.setState({
                    countdown: countdown - 1,
                });
            } else {
                this.setState({
                    countdown: 0,
                });
                clearInterval(this.countdownInterval);
            }
        }, 1000);
    }

    private stopCoundown() {
        if (!this.logoRef) {
            return;
        }
        this.logoRef.classList.remove('a-enable', 'c-enable');
    }
}

export default SignUp;
