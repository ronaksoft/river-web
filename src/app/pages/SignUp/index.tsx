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
import {CloseRounded, DoneRounded, RefreshRounded} from '@material-ui/icons';
import {C_ERR, C_ERR_ITEM} from '../../services/sdk/const';
import RiverLogo from '../../components/RiverLogo';
import NotificationService from '../../services/notification';
import {C_VERSION, languageList} from '../../components/SettingsMenu';
import TextField from '@material-ui/core/TextField';
import {TimerRounded, ArrowForwardRounded, CropFreeRounded, LanguageRounded} from '@material-ui/icons';
import {SystemInfo} from '../../services/sdk/messages/chat.api.system_pb';
import WorkspaceManger from '../../services/workspaceManager';
import SettingsModal from '../../components/SettingsModal';
import jsQR from 'jsqr';
import {defaultGateway} from '../../services/sdk/server/socket';
import UserRepo from '../../repository/user';
import i18n from '../../services/i18n';
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import IframeService, {C_IFRAME_SUBJECT} from "../../services/iframe";
import {find} from 'lodash';
import FileManager from "../../services/sdk/fileManager";
import {OptionsObject, withSnackbar} from 'notistack';

import './tel-input.css';
import './style.scss';
import ElectronService from "../../services/electron";
import DevTools from "../../components/DevTools";


const C_CLIENT = `Web:- ${window.navigator.userAgent}`;
const codeLen = 5;
const codePlaceholder = [...new Array(codeLen)].map(o => '_').join('');

interface IProps {
    match?: any;
    location?: any;
    history?: any;
    enqueueSnackbar?: (message: string | React.ReactNode, options?: OptionsObject) => OptionsObject['key'] | null;
}

interface IState {
    anchorEl: any;
    code: string;
    countdown: number;
    fName: string;
    iframeActive: boolean;
    lName: string;
    languageDialogOpen: boolean;
    loading: boolean;
    phone?: string;
    phoneHash?: string;
    sendToPhone: boolean;
    qrCodeOpen: boolean;
    selectedLanguage: string;
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
    private iframeService: IframeService;
    private versionClickTimeout: any = null;
    private versionClickCounter: number = 0;
    private devToolsRef: DevTools | undefined;
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);
        let step = 'phone';
        if (window.location.host !== 'web.river.im' && window.location.host !== 'web.river.ronaksoftware.com') {
            if (!localStorage.getItem('river.workspace_url')) {
                step = 'workspace';
            }
        }

        if (props.match.params.mode === 'workspace' && ElectronService.isElectron()) {
            step = 'workspace';
        }

        this.iframeService = IframeService.getInstance();
        this.state = {
            anchorEl: null,
            code: '',
            countdown: 60,
            fName: '',
            iframeActive: this.iframeService.isActive(),
            lName: '',
            languageDialogOpen: false,
            loading: false,
            phone: '',
            phoneHash: '',
            qrCodeOpen: false,
            selectedLanguage: localStorage.getItem('river.lang') || 'en',
            sendToPhone: false,
            step,
            tries: 0,
            workspace: 'cyrus.river.im',
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
        if (this.sdk.getConnInfo().AuthID === '0' && this.props.match.params.mode !== 'workspace') {
            this.props.history.push('/loading');
        }
        if (this.sdk.isStarted()) {
            this.wsOpenHandler();
        }
        this.initPhoneInput();
        if (!this.state.iframeActive) {
            this.eventReferences.push(this.iframeService.listen(C_IFRAME_SUBJECT.IsLoaded, (e) => {
                this.setState({
                    iframeActive: true,
                });
            }));
        }

        this.eventReferences.push(this.iframeService.listen(C_IFRAME_SUBJECT.UserInfo, (e) => {
            this.iframeService.bool(e.reqId);
            this.setState({
                fName: e.data.firstname,
                lName: e.data.lastname,
                phone: e.data.phone,
                workspace: e.data.workspace,
            });
        }));
    }

    public componentWillUnmount() {
        window.removeEventListener('wasmInit', this.wasmInitHandler);
        window.removeEventListener('wsOpen', this.wsOpenHandler);
        clearInterval(this.countdownInterval);
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {step, countdown, workspaceInfo, iframeActive, sendToPhone} = this.state;
        return (
            <div className="login-page">
                <DevTools ref={this.devToolsRefHandler}/>
                <div className="login-page-container">
                    {iframeActive && <span className="close-btn">
                                    <Tooltip
                                        title={i18n.t('general.close')}
                                        placement="bottom"
                                        onClick={this.closeIframeHandler}
                                    >
                                        <IconButton>
                                            <CloseRounded/>
                                        </IconButton>
                                    </Tooltip>
                                </span>}
                    <div className="top-logo">
                        <RiverLogo height={184} width={165}/>
                    </div>
                    <div className="top-title">{i18n.t('sign_up.sign_in_to_river')}</div>
                    <div className="top-desc">
                        {step === 'workspace' && <span>{i18n.t('sign_up.please_enter_your_workspace_url')}</span>}
                        {step === 'phone' && <span>{i18n.t('sign_up.please_enter_your_phone_number')}</span>}
                        {step === 'code' && <span>{i18n.t('sign_up.please_enter_the_code_sent_to_your_phone')}</span>}
                        {step === 'register' && <span>{i18n.t('sign_up.please_fill_in_your_contact_info')}</span>}
                    </div>
                    <div className="login-wrapper">
                        <div className="login-form river-form flex-sb flex-w">
                            <div className="input-wrapper">
                                {step === 'workspace' &&
                                <TextField type="text" label={i18n.t('sign_up.workspace')}
                                           placeholder={i18n.t('sign_up.enter_your_workspace_url')}
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
                                <div className="qr-link"
                                     onClick={this.qrCodeDialogOpenHandler}>{i18n.t('sign_up.scan_qr_code')}</div>
                            </div>}
                            {step !== 'workspace' && <React.Fragment>
                                <IntlTelInput preferredCountries={[]} defaultCountry={'ir'} value={this.state.phone}
                                              inputClassName="f-phone" disabled={this.state.loading || step === 'code'}
                                              autoHideDialCode={false} onPhoneNumberChange={this.handleOnChange}
                                              onKeyDown={this.sendCodeKeyDown} nationalMode={false}
                                              fieldId="input-phone"/>
                                {Boolean(step === 'phone' && ElectronService.isElectron() && false) &&
                                <div className="grey-link">
                                    <span
                                        onClick={this.changeWorkspaceHandler}>{i18n.t('sign_up.change_workspace')}</span>
                                </div>}
                                {Boolean((this.state.tries > 0 && (step === 'code' || step === 'register')) || (countdown < 45)) &&
                                <div className="try-another-phone" onClick={this.tryAnotherPhone}>
                                    <RefreshRounded/>
                                    <label>
                                        {i18n.t('sign_up.try_another_phone')}
                                    </label>
                                </div>}
                                {step === 'code' && countdown !== 0 && <div className="input-wrapper validate-input">
                                    <TextField
                                        label={i18n.t('sign_up.code')}
                                        placeholder={codePlaceholder}
                                        margin="none"
                                        variant="outlined"
                                        className="code f-code text-input"
                                        type="text"
                                        fullWidth={true}
                                        value={this.state.code} onChange={this.codeOnChange}
                                        onKeyDown={this.confirmKeyDown}
                                    />
                                    <div className="countdown">
                                        <TimerRounded/><span
                                        className="inner">{countdown}&nbsp;{i18n.t('sign_up.second')}</span>
                                    </div>
                                    {sendToPhone &&
                                    <div className={'grey-link ' + (countdown >= 45 ? 'disabled' : '')}>
                                        <span onClick={this.resendCode}>{i18n.t('sign_up.resend_code')}</span>
                                    </div>}
                                    {!sendToPhone && <div className="grey-link">
                                        <span onClick={this.resendCode}>{i18n.t('sign_up.send_as_sms')}</span>
                                    </div>}
                                </div>}
                                {step === 'register' &&
                                <div className="input-wrapper validate-input">
                                    <TextField className="f-fname text-input" type="text"
                                               label={i18n.t('general.first_name')}
                                               margin="none" variant="outlined" autoComplete="off"
                                               fullWidth={true}
                                               value={this.state.fName}
                                               onKeyDown={this.registerKeyDown}
                                               onChange={this.fNameOnChange}/>
                                    <span className="focus-input"/>
                                </div>}
                                {step === 'register' &&
                                <div className="input-wrapper validate-input">
                                    <TextField className="f-lname text-input" type="text"
                                               label={i18n.t('general.last_name')}
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
                <div className="login-bottom-bar">
                    <div className="version-container" onClick={this.versionClickHandler}>{C_VERSION}</div>
                    <div className="link-container">
                        <a href="https://river.im" target="_blank"
                           rel="noopener noreferrer">{i18n.t('sign_up.home')}</a>
                        <span className="bullet"/>
                        <a href="https://river.im/faq" target="_blank"
                           rel="noopener noreferrer">{i18n.t('sign_up.faq')}</a>
                        <span className="bullet"/>
                        <a href="https://river.im/terms" target="_blank"
                           rel="noopener noreferrer">{i18n.t('sign_up.term_of_services')}</a>
                    </div>
                    <div className="language-container"
                         onClick={this.showLanguageDialogHandler}>{i18n.t(`sign_up.${this.state.selectedLanguage}`)}</div>
                </div>
                <SettingsModal
                    open={this.state.qrCodeOpen}
                    onClose={this.qrCodeDialogCloseHandler}
                    title={i18n.t('sign_up.scan_qr_code')}
                    fit={true}
                    icon={<CropFreeRounded/>}
                    noScrollbar={true}
                >
                    <div className="qr-code-container">
                        <canvas ref={this.qrCanvasRefHandler} height="320" width="320"/>
                    </div>
                </SettingsModal>
                <SettingsModal
                    open={this.state.languageDialogOpen}
                    onClose={this.languageDialogCloseHandler}
                    title={i18n.t('sign_up.change_language')}
                    icon={<LanguageRounded/>}
                >
                    <div className="language-list-container">
                        {languageList.map((item, key) => {
                            return (<div key={key} className="language-item"
                                         onClick={this.changeLanguage(item.lang)}>
                                <div className="language-label">{item.title}</div>
                                <div className="check">
                                    {item.lang === this.state.selectedLanguage && <DoneRounded/>}
                                </div>
                            </div>);
                        })}
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
                }, () => {
                    this.initPhoneInput();
                });
                if (res.storageurl && res.storageurl.length > 0) {
                    localStorage.setItem('river.workspace_url_file', res.storageurl || '');
                    FileManager.getInstance().setUrl(res.storageurl);
                }
                const localWorkspace = localStorage.getItem('river.workspace_url');
                if ((localWorkspace || 'cyrus.river.im') !== workspace) {
                    this.workspaceManager.closeWire();
                    localStorage.setItem('river.workspace_url', workspace);
                    localStorage.removeItem('river.contacts.hash');
                    localStorage.removeItem('river.conn.info');
                    window.location.reload();
                } else if ((!localWorkspace || localWorkspace === '') && workspace === defaultGateway) {
                    localStorage.setItem('river.workspace_url', workspace);
                }

            });
        }).catch((err) => {
            window.console.warn(err);
            this.setState({
                loading: false,
                workspaceError: i18n.t('sign_up.cannot_reach_to_server'),
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
                sendToPhone: data.sendtophone || false,
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

    private modifyCode(str: string, remove?: boolean): { code: string, len: number } {
        const s = codePlaceholder.split('');
        let nums = str.match(/\d+/g);
        const len = nums ? nums.join('').length : 0;
        if (nums) {
            nums = nums.join('').split('').slice(0, codeLen);
            nums.forEach((val, key) => {
                if (remove && nums && nums.length > 0 && nums.length - 1 === key) {
                    s[key] = '_';
                } else {
                    s[key] = val;
                }
            });
        }
        return {code: s.join(''), len};
    }

    private codeOnChange = (e: any) => {
        const data = this.modifyCode(e.target.value);
        this.setState({
            code: data.code,
        }, () => {
            if (data.len === codeLen) {
                this.confirmCode();
            }
        });
    }

    private confirmCode = () => {
        if (this.state.loading) {
            return;
        }
        const {phone, phoneHash, code, countdown} = this.state;
        if ((!phone || !phoneHash || (code.length < codeLen && countdown !== 0))) {
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
                UserRepo.getInstance().importBulk(false, [res.user]);
                this.setState({
                    loading: false,
                    tries: this.state.tries + 1,
                });
                this.props.history.push('/chat/null');
                this.dispatchWSOpenEvent();
                this.notification.initToken().then((token) => {
                    this.sdk.registerDevice(token, 0, C_VERSION, C_CLIENT, 'en', '1');
                }).catch(() => {
                    this.sdk.registerDevice('', 0, C_VERSION, C_CLIENT, 'en', '1');
                });
            }).catch((err) => {
                window.console.debug(err);
                this.setState({
                    loading: false,
                    tries: this.state.tries + 1,
                });
                if (err.code === C_ERR.ErrCodeInvalid && err.items === C_ERR_ITEM.ErrItemPhoneCode) {
                    if (this.props.enqueueSnackbar) {
                        this.props.enqueueSnackbar(i18n.t('sign_up.code_is_incorrect'));
                    }
                    return;
                }
                if (err.code === C_ERR.ErrCodeUnavailable && err.items === C_ERR_ITEM.ErrItemPhone) {
                    let state: any = {};
                    if (this.iframeService.isActive()) {
                        state = {
                            step: 'register',
                        };
                    } else {
                        state = {
                            fName: '',
                            lName: '',
                            step: 'register',
                        };
                    }
                    this.setState(state, () => {
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
        const {phone, phoneHash, countdown, sendToPhone} = this.state;
        if (!phone || !phoneHash || (countdown >= 45 && sendToPhone)) {
            return;
        }
        this.setState({
            loading: true,
        });
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

    private confirmKeyDown = (e: any) => {
        if (e.key === 'Backspace') {
            e.stopPropagation();
            e.preventDefault();
            const data = this.modifyCode(this.state.code, true);
            this.setState({
                code: data.code,
            });
        } else if (e.key === 'Enter') {
            this.confirmCode();
        }
    }

    private tryAnotherPhone = () => {
        this.setState({
            code: codePlaceholder,
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
        if (!phone || !phoneHash || code.length < codeLen) {
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
                this.sdk.registerDevice('', 0, C_VERSION, C_CLIENT, 'en', '1');
            });
        }).catch((err) => {
            this.setState({
                loading: false,
                tries: this.state.tries + 1,
            });
            if (err.code === C_ERR.ErrCodeInvalid && err.items === C_ERR_ITEM.ErrItemPhoneCode) {
                if (this.props.enqueueSnackbar) {
                    this.props.enqueueSnackbar(i18n.t('sign_up.code_is_incorrect'));
                }
                return;
            }
            if (this.props.enqueueSnackbar) {
                this.props.enqueueSnackbar(`Error! Code:${err.code} Items${err.items}`);
            }
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
            this.sdk.authRecall().then(() => {
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
                if (res.storageurl && res.storageurl.length > 0) {
                    localStorage.setItem('river.workspace_url_file', res.storageurl || '');
                    FileManager.getInstance().setUrl(res.storageurl);
                }
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

    private closeIframeHandler = () => {
        this.iframeService.close();
    }

    private showLanguageDialogHandler = () => {
        this.setState({
            languageDialogOpen: true,
        });
    }

    private changeLanguage = (lang: string) => (e: any) => {
        const l = localStorage.getItem('river.lang');
        if (l !== lang) {
            // @ts-ignore
            const selectedLang = find(languageList, {lang});
            localStorage.setItem('river.lang', lang);
            if (selectedLang) {
                localStorage.setItem('river.lang.dir', selectedLang.dir);
            }
            this.setState({
                selectedLanguage: lang,
            });
            window.location.reload();
        }
    }

    private languageDialogCloseHandler = () => {
        this.setState({
            languageDialogOpen: false,
        });
    }

    /* DevTools ref handler */
    private devToolsRefHandler = (ref: any) => {
        this.devToolsRef = ref;
    }

    /* Version click handler */
    private versionClickHandler = () => {
        if (!this.versionClickTimeout) {
            this.versionClickTimeout = setTimeout(() => {
                clearTimeout(this.versionClickTimeout);
                this.versionClickTimeout = null;
                this.versionClickCounter = 0;
            }, 6000);
        }
        this.versionClickCounter++;
        if (this.versionClickCounter >= 10) {
            clearTimeout(this.versionClickTimeout);
            this.versionClickTimeout = null;
            this.versionClickCounter = 0;
            if (this.devToolsRef) {
                this.devToolsRef.open();
            }
        }
    }
}

export default withSnackbar<any>(SignUp);
