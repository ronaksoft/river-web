/*
    Creation Time: 2018 - Sep - 25
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import APIManager from '../../services/sdk';
// @ts-ignore
import IntlTelInput from 'react-intl-tel-input';
import {CloseRounded, DoneRounded, RefreshRounded} from '@material-ui/icons';
import {C_ERR, C_ERR_ITEM, C_LOCALSTORAGE, C_MSG} from '../../services/sdk/const';
import RiverLogo from '../../components/RiverLogo';
import {languageList} from '../../components/SettingsMenu';
import TextField from '@material-ui/core/TextField';
import {TimerRounded, ArrowForwardRounded, CropFreeRounded, LanguageRounded} from '@material-ui/icons';
import {SystemInfo} from '../../services/sdk/messages/system_pb';
import WorkspaceManger from '../../services/workspaceManager';
import SettingsModal from '../../components/SettingsModal';
import jsQR from 'jsqr';
import {defaultGateway} from '../../services/sdk/server/socket';
import UserRepo from '../../repository/user';
import i18n from '../../services/i18n';
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import IframeService, {C_IFRAME_SUBJECT} from "../../services/iframe";
import {find} from 'lodash';
import FileManager from "../../services/sdk/fileManager";
import {OptionsObject, withSnackbar} from 'notistack';
import ElectronService from "../../services/electron";
import DevTools from "../../components/DevTools";
import {modifyCode} from "./utils";
import {AuthAuthorization} from "../../services/sdk/messages/auth_pb";
import {AccountPassword, SecurityQuestion} from "../../services/sdk/messages/accounts_pb";
import {extractPhoneNumber, faToEn} from "../../services/utilities/localize";
import RecoveryQuestionModal from "../../components/RecoveryQuestionModal";
import {EventFocus, EventWasmInit, EventWebSocketOpen} from "../../services/events";
import {detect} from 'detect-browser';
import {C_VERSION} from "../../../App";
import SessionDialog from "../../components/SessionDialog";

import './tel-input.css';
import './style.scss';

let C_CLIENT = `Web:- ${window.navigator.userAgent}`;
const electronVersion = ElectronService.electronVersion();
const browserVersion = detect();
if (electronVersion) {
    C_CLIENT = `Desktop:- ${electronVersion} ${(browserVersion ? '(' + browserVersion.os + ')' : '')}`;
} else if (browserVersion) {
    C_CLIENT = `Web:- ${browserVersion.name} ${browserVersion.version} (${browserVersion.os})`;
}

export const codeLen = 5;
export const codePlaceholder = [...new Array(codeLen)].map(o => '_').join('');

interface IProps {
    match?: any;
    location?: any;
    history?: any;
    enqueueSnackbar?: (message: string | React.ReactNode, options?: OptionsObject) => OptionsObject['key'] | null;
}

interface IState {
    accountPassword?: AccountPassword;
    anchorEl: any;
    code: string;
    countdown: number;
    firstName: string;
    iframeActive: boolean;
    languageDialogOpen: boolean;
    lastName: string;
    loading: boolean;
    password: string;
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
    private apiManager: APIManager;
    private countdownInterval: any = null;
    private workspaceManager: WorkspaceManger;
    private qrCanvasRef: any = null;
    private qrStart: boolean = false;
    private iframeService: IframeService;
    private versionClickTimeout: any = null;
    private versionClickCounter: number = 0;
    private devToolsRef: DevTools | undefined;
    private eventReferences: any[] = [];
    private recoveryQuestionModalRef: RecoveryQuestionModal | undefined;
    private sessionDialogRef: SessionDialog | undefined;
    private sessionLimit: boolean = false;

    constructor(props: IProps) {
        super(props);
        let step = 'phone';
        if (window.location.host !== 'web.river.im' && window.location.host !== 'web.river.ronaksoftware.com') {
            if (!localStorage.getItem(C_LOCALSTORAGE.ServerMode)) {
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
            firstName: '',
            iframeActive: this.iframeService.isActive(),
            languageDialogOpen: false,
            lastName: '',
            loading: false,
            password: '',
            phone: '',
            phoneHash: '',
            qrCodeOpen: false,
            selectedLanguage: localStorage.getItem(C_LOCALSTORAGE.Lang) || 'en',
            sendToPhone: false,
            step,
            tries: 0,
            workspace: 'cyrus.river.im',
            workspaceError: '',
            workspaceInfo: {},
        };
        this.apiManager = APIManager.getInstance();
        this.workspaceManager = WorkspaceManger.getInstance();
    }

    public componentDidMount() {
        window.addEventListener(EventWasmInit, this.wasmInitHandler);
        window.addEventListener(EventWebSocketOpen, this.wsOpenHandler);
        window.addEventListener(EventFocus, this.windowFocusHandler);
        this.apiManager.loadConnInfo();
        if (this.apiManager.getConnInfo().AuthID === '0' && this.props.match.params.mode !== 'workspace') {
            this.props.history.push('/loading');
        }
        if (this.apiManager.isStarted()) {
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
                firstName: e.data.firstname,
                lastName: e.data.lastname,
                phone: e.data.phone,
                workspace: e.data.workspace,
            });
        }));

        if (this.state.step === 'phone') {
            this.focus('f-phone');
        }
    }

    public componentWillUnmount() {
        window.removeEventListener(EventWasmInit, this.wasmInitHandler);
        window.removeEventListener(EventWebSocketOpen, this.wsOpenHandler);
        window.removeEventListener(EventFocus, this.windowFocusHandler);
        clearInterval(this.countdownInterval);
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {step, countdown, workspaceInfo, iframeActive, sendToPhone, accountPassword} = this.state;
        return (
            <div className="login-page">
                <DevTools ref={this.devToolsRefHandler}/>
                <RecoveryQuestionModal ref={this.recoveryQuestionModalRefHandler}
                                       onDone={this.recoveryQuestionModalDoneHandler}/>
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
                            {Boolean(step !== 'workspace') && <React.Fragment>
                                {step !== 'password' &&
                                <IntlTelInput preferredCountries={[]} defaultCountry={'ir'} value={this.state.phone}
                                              inputClassName="f-phone"
                                              disabled={this.state.loading || step === 'code' || step === 'password'}
                                              autoHideDialCode={false} onPhoneNumberChange={this.phoneChangeHandler}
                                              onKeyDown={this.sendCodeKeyDownHandler} nationalMode={false}
                                              fieldId="input-phone"/>}
                                {step === 'password' &&
                                <div className="sign-up-note">{i18n.t('sign_up.password_note')}</div>}
                                {Boolean(step === 'phone' && ElectronService.isElectron() && false) &&
                                <div className="grey-link">
                                    <span
                                        onClick={this.changeWorkspaceHandler}>{i18n.t('sign_up.change_workspace')}</span>
                                </div>}
                                {Boolean((this.state.tries > 0 && (step === 'code' || step === 'register')) || (countdown < 45)) &&
                                <div className="try-another-phone" onClick={this.tryAnotherPhoneHandler}>
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
                                        value={this.state.code} onChange={this.codeChangeHandler}
                                        onKeyDown={this.confirmKeyDownHandler}
                                    />
                                    <div className="countdown">
                                        <TimerRounded/><span
                                        className="inner">{countdown}&nbsp;{i18n.t('sign_up.second')}</span>
                                    </div>
                                    {sendToPhone &&
                                    <div className={'grey-link ' + (countdown >= 45 ? 'disabled' : '')}>
                                        <span onClick={this.resendCodeHandler}>{i18n.t('sign_up.resend_code')}</span>
                                    </div>}
                                    {!sendToPhone && <div className="grey-link">
                                        <span onClick={this.resendCodeHandler}>{i18n.t('sign_up.send_as_sms')}</span>
                                    </div>}
                                </div>}
                                {step === 'password' && <>
                                    <div className="input-wrapper validate-input">
                                        <TextField className="f-password text-input" type="password"
                                                   label={i18n.t('general.password')}
                                                   margin="none" variant="outlined" autoComplete="off"
                                                   fullWidth={true}
                                                   value={this.state.password}
                                                   onKeyDown={this.passwordKeyDownHandler}
                                                   onChange={this.passwordChangeHandler}
                                                   helperText={accountPassword ? accountPassword.getHint() : ''}
                                        />
                                        <span className="focus-input"/>
                                    </div>
                                    {Boolean(accountPassword && accountPassword.getQuestionsList().length > 0) &&
                                    <div className="input-wrapper">
                                        <Button color="secondary" fullWidth={true} onClick={this.recoverPasswordHandler}
                                        >{i18n.t('settings.2fa.recover_password')}</Button>
                                    </div>}
                                </>}
                                {step === 'register' &&
                                <div className="input-wrapper validate-input">
                                    <TextField className="f-fname text-input" type="text"
                                               label={i18n.t('general.first_name')}
                                               margin="none" variant="outlined" autoComplete="off"
                                               fullWidth={true}
                                               value={this.state.firstName}
                                               onKeyDown={this.registerKeyDownHandler}
                                               onChange={this.firstNameChangeHandler}
                                    />
                                    <span className="focus-input"/>
                                </div>}
                                {step === 'register' &&
                                <div className="input-wrapper validate-input">
                                    <TextField className="f-lname text-input" type="text"
                                               label={i18n.t('general.last_name')}
                                               margin="none" variant="outlined" autoComplete="off"
                                               fullWidth={true}
                                               value={this.state.lastName}
                                               onKeyDown={this.registerKeyDownHandler}
                                               onChange={this.lastNameChangeHandler}
                                    />
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
                                         onClick={this.sendCodeHandler}>
                                        <ArrowForwardRounded/>
                                    </div>
                                </React.Fragment>}
                                {step === 'code' && <React.Fragment>
                                    <div className={'login-form-btn' + (this.state.loading ? ' disabled' : '')}
                                         onClick={this.confirmCodeHandler}>
                                        <ArrowForwardRounded/>
                                    </div>
                                </React.Fragment>}
                                {step === 'password' && <React.Fragment>
                                    <div className={'login-form-btn' + (this.state.loading ? ' disabled' : '')}
                                         onClick={this.submitPasswordHandler}>
                                        <ArrowForwardRounded/>
                                    </div>
                                </React.Fragment>}
                                {step === 'register' &&
                                <div className={'login-form-btn' + (this.state.loading ? ' disabled' : '')}
                                     onClick={this.registerHandler}>
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
                        <a href="https://river.im/privacy" target="_blank"
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
                <SessionDialog ref={this.sessionDialogRefHandler}/>
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

    private phoneChangeHandler = (e: any, value: any) => {
        let phone = faToEn(value);
        let focus = false;
        if (phone.indexOf('09') === 0) {
            phone = phone.replace('09', `+989`);
            focus = true;
        }
        this.setState({
            phone: extractPhoneNumber(phone),
        }, () => {
            if (focus) {
                this.focus('f-phone');
            }
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
                    localStorage.setItem(C_LOCALSTORAGE.WorkspaceFileUrl, res.storageurl || '');
                    localStorage.setItem(C_LOCALSTORAGE.ServerMode, 'other');
                    FileManager.getInstance().setUrl(res.storageurl);
                }
                const localWorkspace = localStorage.getItem(C_LOCALSTORAGE.WorkspaceUrl);
                if ((localWorkspace || 'cyrus.river.im') !== workspace) {
                    this.workspaceManager.closeWire();
                    localStorage.setItem(C_LOCALSTORAGE.ServerMode, 'other');
                    localStorage.setItem(C_LOCALSTORAGE.WorkspaceUrl, workspace);
                    localStorage.removeItem(C_LOCALSTORAGE.ContactsHash);
                    localStorage.removeItem(C_LOCALSTORAGE.ConnInfo);
                    window.location.reload();
                } else if ((!localWorkspace || localWorkspace === '') && workspace === defaultGateway) {
                    localStorage.setItem(C_LOCALSTORAGE.ServerMode, 'other');
                    localStorage.setItem(C_LOCALSTORAGE.WorkspaceUrl, workspace);
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

    private sendCodeHandler = () => {
        if (!this.state.phone) {
            return;
        }
        this.setState({
            loading: true,
        });
        this.apiManager.sendCode(this.state.phone).then((data) => {
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
        }).catch((err) => {
            this.setState({
                loading: false,
            });
            if (this.props.enqueueSnackbar && err.code === C_ERR.ErrCodeInternal && err.items === C_ERR_ITEM.ErrItemTimeout) {
                this.props.enqueueSnackbar(i18n.t('sign_up.timeout'));
            }
        });
    }

    private sendCodeKeyDownHandler = (e: any) => {
        if (e.key === 'Enter') {
            this.sendCodeHandler();
        }
    }

    private codeChangeHandler = (e: any) => {
        const data = modifyCode(faToEn(e.target.value));
        this.setState({
            code: data.code,
        }, () => {
            if (data.len === codeLen) {
                this.confirmCodeHandler();
            }
        });
    }

    private confirmCodeHandler = () => {
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
            this.apiManager.resendCode(phone.slice(1), phoneHash).then(() => {
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
            this.apiManager.login(phone.slice(1), code, phoneHash).then((res) => {
                // @ts-ignore
                if (res.user) {
                    this.login(res as AuthAuthorization.AsObject);
                } else {
                    this.setState({
                        accountPassword: res as AccountPassword,
                        loading: false,
                        step: 'password',
                    }, () => {
                        this.stopCountdown();
                        this.focus('f-password');
                    });
                }
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

    private login(res: AuthAuthorization.AsObject) {
        const info = this.apiManager.loadConnInfo();
        info.UserID = res.user.id;
        info.FirstName = res.user.firstname;
        info.LastName = res.user.lastname;
        info.Phone = this.state.phone;
        this.apiManager.setConnInfo(info);
        UserRepo.getInstance().importBulk(false, [res.user]);
        this.setState({
            loading: false,
            tries: this.state.tries + 1,
        });
        const redirectFn = () => {
            this.props.history.push('/chat/0/null');
            this.dispatchWSOpenEvent();
            // this.notification.initToken().then((token) => {
            //     this.apiManager.registerDevice(token, 0, C_VERSION, C_CLIENT, 'en', '1');
            // }).catch(() => {
            this.apiManager.registerDevice('', 0, C_VERSION, C_CLIENT, 'en', '1');
            // });
        };
        const maxSessions = this.apiManager.getInstantSystemConfig().maxactivesessions || 7;
        if (maxSessions < (res.activesessions || 0)) {
            this.sessionLimit = true;
            if (this.sessionDialogRef) {
                this.sessionDialogRef.openDialog(maxSessions).then(() => {
                    redirectFn();
                });
            }
        } else {
            redirectFn();
        }
    }

    private resendCodeHandler = () => {
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
        this.apiManager.resendCode(phone.slice(1), phoneHash).then(() => {
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

    private confirmKeyDownHandler = (e: any) => {
        if (e.key === 'Backspace') {
            e.stopPropagation();
            e.preventDefault();
            const data = modifyCode(this.state.code, true);
            this.setState({
                code: data.code,
            });
        } else if (e.key === 'Enter') {
            this.confirmCodeHandler();
        }
    }

    private tryAnotherPhoneHandler = () => {
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

    private firstNameChangeHandler = (e: any) => {
        this.setState({
            firstName: e.target.value,
        });
    }

    private lastNameChangeHandler = (e: any) => {
        this.setState({
            lastName: e.target.value,
        });
    }

    private passwordChangeHandler = (e: any) => {
        this.setState({
            password: e.target.value,
        });
    }

    private recoverPasswordHandler = () => {
        const {accountPassword} = this.state;
        if (accountPassword && this.recoveryQuestionModalRef) {
            this.recoveryQuestionModalRef.openDialog(accountPassword.toObject().questionsList.map(o => {
                    return {
                        answer: '',
                        id: o.id,
                        text: o.text,
                    };
                }
            ), true);
        }
    }

    private recoveryQuestionModalRefHandler = (ref: any) => {
        this.recoveryQuestionModalRef = ref;
    }

    private recoveryQuestionModalDoneHandler = (list: SecurityQuestion.AsObject[]) => {
        const {accountPassword} = this.state;
        if (accountPassword) {
            this.apiManager.accountRecover(accountPassword.getAlgorithm() || C_MSG.PasswordAlgorithmVer6A, accountPassword.getAlgorithmdata_asU8(), accountPassword.getSrpid() || '', list.filter(o => {
                return (o.answer || '') !== '';
            }).map(o => {
                return {
                    answer: o.answer || '',
                    questionid: o.id || 0,
                };
            })).then((res) => {
                // @ts-ignore
                if (res.user) {
                    this.login(res as AuthAuthorization.AsObject);
                }
            }).catch((err: any) => {
                if (!this.props.enqueueSnackbar) {
                    return;
                }
                if (err.code === C_ERR.ErrCodeInvalid && (err.items === C_ERR_ITEM.ErrItemSecurityAnswer || err.items === C_ERR_ITEM.ErrItemSecurityQuestion)) {
                    this.props.enqueueSnackbar(i18n.t('settings.2fa.security_answer_are_wrong'));
                } else if (err.code === C_ERR.ErrCodeTooFew && err.items === C_ERR_ITEM.ErrItemSecurityAnswer) {
                    this.props.enqueueSnackbar(i18n.t('settings.2fa.security_answer_are_wrong'));
                }
            });
        }
    }

    private registerHandler = () => {
        const {phone, phoneHash, code, firstName, lastName} = this.state;
        if (!phone || !phoneHash || code.length < codeLen) {
            return;
        }
        if (firstName.length === 0 && lastName.length === 0) {
            if (this.props.enqueueSnackbar) {
                this.props.enqueueSnackbar(i18n.t('sign_up.please_fill_the_form'));
            }
            return;
        }
        this.setState({
            loading: true,
        });
        const lang = localStorage.getItem(C_LOCALSTORAGE.Lang) || 'en';
        this.apiManager.register(phone, code, phoneHash, firstName, lastName, lang).then((res) => {
            const info = this.apiManager.loadConnInfo();
            info.UserID = res.user.id;
            info.FirstName = res.user.firstname;
            info.LastName = res.user.lastname;
            info.Phone = this.state.phone;
            this.apiManager.setConnInfo(info);
            this.setState({
                loading: false,
                tries: this.state.tries + 1,
            });
            this.props.history.push('/chat/0/null');
            this.dispatchWSOpenEvent();
            // this.notification.initToken().then((token) => {
            //     this.apiManager.registerDevice(token, 0, C_VERSION, C_CLIENT, 'en', '1');
            // }).catch(() => {
            this.apiManager.registerDevice('', 0, C_VERSION, C_CLIENT, 'en', '1');
            // });
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

    private registerKeyDownHandler = (e: any) => {
        if (e.key === 'Enter') {
            this.registerHandler();
        }
    }

    private passwordKeyDownHandler = (e: any) => {
        if (e.key === 'Enter') {
            this.submitPasswordHandler();
        }
    }

    private focus(className: string) {
        const elem: any = document.querySelector(`.${className} input, input.${className}`);
        if (elem) {
            elem.focus();
            setTimeout(() => {
                if (elem) {
                    elem.setSelectionRange(elem.value.length, elem.value.length);
                }
            }, 10);
        }
    }

    private dispatchWSOpenEvent() {
        setTimeout(() => {
            const event = new CustomEvent(EventWebSocketOpen);
            window.dispatchEvent(event);
        }, 100);
    }

    private wasmInitHandler = () => {
        if (parseInt(this.apiManager.getConnInfo().AuthID, 10) === 0) {
            this.props.history.push('/loading');
        }
    }

    private wsOpenHandler = () => {
        this.apiManager.authRecall().then(() => {
            if ((this.apiManager.getConnInfo().UserID || 0) > 0 && !this.sessionLimit) {
                this.props.history.push('/chat/0/null');
            }
        });
        if (this.state.step === 'phone') {
            this.apiManager.systemGetInfo().then((res) => {
                this.setState({
                    workspaceInfo: res,
                }, () => {
                    this.focus('f-phone');
                });
                if (res.storageurl && res.storageurl.length > 0) {
                    localStorage.setItem(C_LOCALSTORAGE.WorkspaceFileUrl, res.storageurl || '');
                    // localStorage.setItem(C_LOCALSTORAGE.ServerMode, 'other');
                    FileManager.getInstance().setUrl(res.storageurl);
                }
            });
        }
    }

    private windowFocusHandler = () => {
        if (this.state.step === 'phone') {
            this.focus('f-phone');
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
            el.onkeydown = this.sendCodeKeyDownHandler;
        }
        this.focus('f-phone');
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
        const l = localStorage.getItem(C_LOCALSTORAGE.Lang);
        if (l !== lang) {
            const selectedLang = find(languageList, {lang});
            localStorage.setItem(C_LOCALSTORAGE.Lang, lang);
            if (selectedLang) {
                localStorage.setItem(C_LOCALSTORAGE.LangDir, selectedLang.dir);
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

    private submitPasswordHandler = () => {
        const {password, accountPassword} = this.state;
        if (password.length === 0 || !accountPassword) {
            return;
        }
        const srpId = accountPassword.getSrpid() || '';
        this.apiManager.genInputPassword(password, accountPassword).then((inputPassword) => {
            inputPassword.setSrpid(srpId);
            this.apiManager.loginByPassword(inputPassword).then((res) => {
                this.login(res);
            }).catch(() => {
                if (this.props.enqueueSnackbar) {
                    this.props.enqueueSnackbar(i18n.t('sign_up.incorrect_password'));
                }
            });
        });
    }

    private sessionDialogRefHandler = (ref: any) => {
        this.sessionDialogRef = ref;
    }
}

export default withSnackbar<any>(SignUp);
