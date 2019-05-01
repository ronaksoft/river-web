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
import {RefreshRounded} from '@material-ui/icons';
import {C_ERR, C_ERR_ITEM} from '../../services/sdk/const';
import RiverLogo from '../../components/RiverLogo';
import NotificationService from '../../services/notification';
import {C_VERSION} from '../../components/SettingsMenu';
import TextField from '@material-ui/core/TextField';
import {TimerRounded, ArrowForwardRounded, CropFreeRounded} from '@material-ui/icons';
import {SystemInfo} from '../../services/sdk/messages/chat.api.system_pb';
import WorkspaceManger from '../../services/workspaceManager';
import SettingsModal from '../../components/SettingsModal';
import jsQR from 'jsqr';

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
    qrCodeOpen: boolean;
    snackOpen: boolean;
    snackText: string;
    step: string;
    tries: number;
    workspace: string;
    workspaceError: string;
    workspaceInfo: SystemInfo.AsObject;
}

class SignUp extends React.Component<IProps, IState> {
    private sdk: SDK;
    private notification: NotificationService;
    private countdownInterval: any = null;
    private workspaceManager: WorkspaceManger;
    private qrCanvasRef: any = null;
    private qrStart: boolean = false;

    constructor(props: IProps) {
        super(props);
        let step = 'phone';
        if (window.location.host !== 'web.river.im') {
            if (!localStorage.getItem('river.workspace_url')) {
                step = 'workspace';
            }
        }
        this.state = {
            anchorEl: null,
            code: '',
            countdown: 60,
            fName: '',
            lName: '',
            loading: false,
            phone: '',
            phoneHash: '',
            qrCodeOpen: false,
            snackOpen: false,
            snackText: '',
            step,
            tries: 0,
            workspace: '',
            workspaceError: '',
            workspaceInfo: {},
        };
        this.sdk = SDK.getInstance();
        this.notification = NotificationService.getInstance();
        this.workspaceManager = WorkspaceManger.getInstance();
    }

    public componentDidMount() {
        window.addEventListener('wasmInit', this.wasmInitHandler);
        window.addEventListener('wsOpen', this.wsOpenHandler);
        this.sdk.loadConnInfo();
        if (this.sdk.getConnInfo().AuthID === '0') {
            this.props.history.push('/loading');
        }
        this.initPhoneInput();
    }

    public componentWillUnmount() {
        window.removeEventListener('wasmInit', this.wasmInitHandler);
        window.removeEventListener('wsOpen', this.wsOpenHandler);
        clearInterval(this.countdownInterval);
    }

    public render() {
        // const {moreInfoAnchorEl} = this.state;
        // const open = Boolean(moreInfoAnchorEl);
        const {step, countdown, workspaceInfo} = this.state;
        return (
            <div className="limiter">
                <div className="login-page">
                    <div className="top-logo">
                        <RiverLogo height={184} width={165}/>
                    </div>
                    <div className="top-title">Sign in to River</div>
                    <div className="top-desc">
                        {step === 'workspace' && <span>Please enter you workspace URL</span>}
                        {step === 'phone' && <span>Please enter your phone number</span>}
                        {step === 'code' && <span>Please enter the code sent to your phone</span>}
                        {step === 'register' && <span>Please fill in your contact info</span>}
                    </div>
                    <div className="login-wrapper">
                        <div className="login-form river-form flex-sb flex-w">
                            <div className="input-wrapper">
                                {step === 'workspace' &&
                                <TextField type="text" label="Workspace"
                                           placeholder="Enter your workspace URL"
                                           margin="none" variant="outlined"
                                           className="text-input"
                                           error={Boolean(this.state.workspaceError !== '')}
                                           helperText={Boolean(this.state.workspaceError !== '') ?
                                               <span>{this.state.workspaceError}</span> : undefined}
                                           disabled={Boolean(step !== 'workspace')}
                                           fullWidth={true}
                                           value={this.state.workspace}
                                           onKeyDown={this.workspaceKeyDownHandler}
                                           onChange={this.workspaceChangeHandler}/>}
                                {step !== 'workspace' && workspaceInfo.workgroupname && <div className="text-wrapper">
                                    {workspaceInfo.workgroupname}
                                </div>}
                            </div>
                            {step === 'workspace' && <div className="input-wrapper qr-wrapper">
                                <div className="qr-link" onClick={this.qrCodeDialogOpenHandler}>Scan QR Code</div>
                            </div>}
                            {step !== 'workspace' && <React.Fragment>
                                <IntlTelInput preferredCountries={[]} defaultCountry={'ir'} value={this.state.phone}
                                              inputClassName="f-phone" disabled={this.state.loading || step === 'code'}
                                              autoHideDialCode={false} onPhoneNumberChange={this.handleOnChange}
                                              onKeyDown={this.sendCodeKeyDown} nationalMode={false}
                                              fieldId="input-phone"/>
                                {step === 'phone' &&
                                <div className="grey-link">
                                    <span onClick={this.changeWorkspaceHandler}>Change Workspace</span>
                                </div>}
                                {Boolean((this.state.tries > 0 && (step === 'code' || step === 'register')) || (countdown < 45)) &&
                                <div className="try-another-phone" onClick={this.tryAnotherPhone}>
                                    <RefreshRounded/>
                                    <label>
                                        Try another phone
                                    </label>
                                </div>}
                                {step === 'code' && countdown !== 0 && <div className="input-wrapper validate-input">
                                    <TextField
                                        label="code"
                                        placeholder="____"
                                        margin="none"
                                        variant="outlined"
                                        className="code f-code text-input"
                                        type="text"
                                        fullWidth={true}
                                        value={this.state.code} onChange={this.codeOnChange}
                                        onKeyDown={this.confirmKeyDown}
                                    />
                                    <div className="countdown">
                                        <TimerRounded/><span className="inner">{countdown}&nbsp;s</span>
                                    </div>
                                    <div className={'grey-link ' + (countdown >= 45 ? 'disabled' : '')}>
                                        <span onClick={this.resendCode}>Resend Code</span>
                                    </div>
                                </div>}
                                {step === 'register' &&
                                <div className="input-wrapper validate-input">
                                    <TextField className="f-fname text-input" type="text" label="First Name"
                                               margin="none" variant="outlined" autoComplete="off"
                                               fullWidth={true}
                                               value={this.state.fName}
                                               onKeyDown={this.registerKeyDown}
                                               onChange={this.fNameOnChange}/>
                                    <span className="focus-input"/>
                                </div>}
                                {step === 'register' &&
                                <div className="input-wrapper validate-input">
                                    <TextField className="f-lname text-input" type="text" label="Last Name"
                                               margin="none" variant="outlined" autoComplete="off"
                                               fullWidth={true}
                                               value={this.state.lName}
                                               onKeyDown={this.registerKeyDown}
                                               onChange={this.lNameOnChange}/>
                                    <span className="focus-input"/>
                                </div>}
                            </React.Fragment>}
                            <div className="container-login-form-btn">
                                {step === 'workspace' &&
                                <div className={'login-form-btn' + (this.state.loading ? ' disabled' : '')}
                                     onClick={this.submitWorkspaceHandler}>
                                    <ArrowForwardRounded/>
                                </div>}
                                {step === 'phone' && <React.Fragment>
                                    <div className={'login-form-btn' + (this.state.loading ? ' disabled' : '')}
                                         onClick={this.sendCode}>
                                        <ArrowForwardRounded/>
                                    </div>
                                </React.Fragment>}
                                {step === 'code' && <React.Fragment>
                                    <div className={'login-form-btn' + (this.state.loading ? ' disabled' : '')}
                                         onClick={this.confirmCode}>
                                        <ArrowForwardRounded/>
                                    </div>
                                </React.Fragment>}
                                {step === 'register' &&
                                <div className={'login-form-btn' + (this.state.loading ? ' disabled' : '')}
                                     onClick={this.register}>
                                    <ArrowForwardRounded/>
                                </div>}
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
                <SettingsModal
                    open={this.state.qrCodeOpen}
                    onClose={this.qrCodeDialogCloseHandler}
                    title="Scan QR Code"
                    fit={true}
                    icon={<CropFreeRounded/>}
                    noScrollbar={true}
                >
                    <div className="qr-code-container">
                        <canvas ref={this.qrCanvasRefHandler} height="320" width="320"/>
                    </div>
                </SettingsModal>
            </div>
        );
    }

    private workspaceKeyDownHandler = (e: any) => {
        if (e.key === 'Enter') {
            this.submitWorkspaceHandler();
        }
    }

    private workspaceChangeHandler = (e: any) => {
        this.setState({
            workspace: e.currentTarget.value,
        });
    }

    private changeWorkspaceHandler = () => {
        this.setState({
            step: 'workspace',
        });
    }

    private handleOnChange = (e: any, value: any) => {
        this.setState({
            phone: value,
        });
    }

    private trimWorkspace(text: string) {
        const texts = text.split('://');
        if (texts.length > 1) {
            return texts[1].toLowerCase();
        }
        return text.toLowerCase();
    }

    private submitWorkspaceHandler = () => {
        if (this.state.loading || this.state.workspace.length === 0) {
            return;
        }
        this.setState({
            loading: true,
        });
        const workspace = this.trimWorkspace(this.state.workspace);
        this.workspaceManager.startWebsocket(workspace).then(() => {
            this.workspaceManager.systemGetInfo().then((res) => {
                this.setState({
                    loading: false,
                    step: 'phone',
                    workspaceError: '',
                    workspaceInfo: res,
                });
                if (localStorage.getItem('river.workspace_url') !== workspace) {
                    this.workspaceManager.closeWire();
                    localStorage.setItem('river.workspace_url', workspace);
                    localStorage.removeItem('river.contacts.hash');
                    localStorage.removeItem('river.conn.info');
                    window.location.reload();
                }
            });
        }).catch((err) => {
            window.console.warn(err);
            this.setState({
                loading: false,
                workspaceError: 'Cannot reach to server',
            });
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
        if (e.key === 'Enter') {
            this.sendCode();
        }
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
        if (this.state.loading) {
            return;
        }
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
                window.console.debug(err);
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

    private resendCode = () => {
        if (this.state.loading) {
            return;
        }
        const {phone, phoneHash, code, countdown} = this.state;
        if ((!phone || !phoneHash || (code.length < 4 && countdown !== 0))) {
            return;
        }
        this.setState({
            loading: true,
        });
        if (countdown < 45) {
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
            this.stopCountdown();
            this.initPhoneInput();
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
        const elem: any = document.querySelector(`.${className} input`);
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
                window.console.warn(err);
            });
        }
        this.focus('f-phone');
        if (this.state.step === 'phone') {
            this.sdk.systemGetInfo().then((res) => {
                this.setState({
                    workspaceInfo: res,
                });
            });
        }
    }

    private startCountdown() {
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

    private stopCountdown() {
        clearInterval(this.countdownInterval);
    }

    private initPhoneInput() {
        const el = document.getElementById('input-phone');
        if (el) {
            el.onkeydown = this.sendCodeKeyDown;
        }
    }

    private qrCodeDialogOpenHandler = () => {
        this.setState({
            qrCodeOpen: true,
        }, () => {
            setTimeout(() => {
                this.initQRCode();
            }, 300);
        });
    }

    private qrCodeDialogCloseHandler = () => {
        this.setState({
            qrCodeOpen: false,
        });
        this.stopQR();
    }

    private qrCanvasRefHandler = (ref: any) => {
        this.qrCanvasRef = ref;
    }

    private initQRCode() {
        if (!this.qrCanvasRef) {
            return;
        }
        this.qrStart = true;
        const video = document.createElement('video');
        // @ts-ignore
        const canvas = this.qrCanvasRef.getContext('2d');
        let tracks: any[] = [];

        // Use facingMode: environment to attempt to get the front camera on phones
        navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}}).then((stream) => {
            video.srcObject = stream;
            video.setAttribute('playsinline', 'true'); // required to tell iOS safari we don't want fullscreen
            video.play();
            tracks = stream.getTracks();
            requestAnimationFrame(tick);
        });

        const tick = () => {
            if (!this.qrStart) {
                video.remove();
                tracks.forEach((track) => {
                    track.stop();
                });
                return;
            }
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                this.qrCanvasRef.hidden = false;

                this.qrCanvasRef.height = video.videoHeight;
                this.qrCanvasRef.width = video.videoWidth;
                canvas.drawImage(video, 0, 0, this.qrCanvasRef.width, this.qrCanvasRef.height);
                const imageData = canvas.getImageData(0, 0, this.qrCanvasRef.width, this.qrCanvasRef.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert',
                });
                if (code) {
                    if (code.data.length > 0) {
                        this.setState({
                            workspace: code.data,
                        });
                        this.qrCodeDialogCloseHandler();
                        setTimeout(() => {
                            this.submitWorkspaceHandler();
                        }, 1000);
                    }
                }
            }
            requestAnimationFrame(tick);
        };
    }

    private stopQR() {
        this.qrStart = false;
    }
}

export default SignUp;
