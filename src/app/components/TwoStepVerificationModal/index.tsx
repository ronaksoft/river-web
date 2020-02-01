/*
    Creation Time: 2020 - Jan - 14
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import SettingsModal from '../SettingsModal';
import {VerifiedUserRounded, VerifiedUserOutlined, CheckCircleOutlineRounded} from '@material-ui/icons';
import i18n from '../../services/i18n';
import Button from '@material-ui/core/Button';
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import TextField from "@material-ui/core/TextField/TextField";
import SDK from "../../services/sdk";
import {AccountPassword, SecurityQuestion} from "../../services/sdk/messages/chat.api.accounts_pb";
import {C_ERR, C_ERR_ITEM, C_MSG} from "../../services/sdk/const";
import {InputPassword} from "../../services/sdk/messages/chat.core.types_pb";
import RecoveryQuestionModal from "../RecoveryQuestionModal";

import './style.scss';

interface IProps {
    onClose?: () => void;
    onError?: (message: string) => void;
    onDone?: () => void;
}

interface IState {
    accountPassword?: AccountPassword;
    hint: string;
    incorrectPassword: boolean;
    mode: string;
    oldPassword: string;
    open: boolean;
    password: string;
    passwordConfirm: string;
    securityQuestions: SecurityQuestion.AsObject[];
    step: number;
}

class TwoStepVerificationModal extends React.Component<IProps, IState> {
    private sdk: SDK;
    private timeout: any = null;
    private recoveryQuestionModalRef: RecoveryQuestionModal | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            hint: '',
            incorrectPassword: false,
            mode: 'change',
            oldPassword: '',
            open: false,
            password: '',
            passwordConfirm: '',
            securityQuestions: [],
            step: 2
        };

        this.sdk = SDK.getInstance();
    }

    public openDialog(edit: boolean) {
        this.setState({
            mode: 'change',
            open: true,
            step: edit ? 1 : 2,
        });
        this.getAccountPassword();
    }

    public componentWillUnmount() {
        clearInterval(this.timeout);
    }

    public render() {
        const {open, step, accountPassword, oldPassword, password, passwordConfirm, hint, mode, securityQuestions, incorrectPassword} = this.state;
        return (
            <>
                <SettingsModal open={open} title={i18n.t('settings.two_step_verification')}
                               icon={<VerifiedUserRounded/>}
                               onClose={this.modalCloseHandler}
                               height="370px"
                               noScrollbar={true}
                >
                    {Boolean(step === 1) && <div className="tsv-dialog">
                        <div className="tsv-header">
                            <VerifiedUserOutlined/>
                        </div>
                        <div className="tsv-text">
                            {i18n.t('settings.2fa.has_password_note')}
                        </div>
                        <div className="tsv-gap"/>
                        <DialogActions>
                            <Button color="secondary" fullWidth={true} onClick={this.nextPageHandler('change')}>
                                {i18n.t('general.change')}
                            </Button>
                        </DialogActions>
                        <DialogActions>
                            <Button color="secondary" fullWidth={true} onClick={this.nextPageHandler('remove')}>
                                {i18n.t('general.deactivate')}
                            </Button>
                        </DialogActions>
                    </div>}
                    {Boolean(step === 2) && <div className="tsv-dialog">
                        {Boolean(accountPassword && accountPassword.getHaspassword()) &&
                        <div className="tsv-input bottom-gap">
                            <TextField
                                fullWidth={true}
                                value={oldPassword}
                                label={i18n.t('settings.2fa.old_password')}
                                margin="dense"
                                variant="outlined"
                                type="password"
                                helperText={
                                    incorrectPassword ?
                                        <span className="recover-password"
                                              onClick={this.recoverPasswordHandler}>{i18n.t('settings.2fa.recover_password')}</span> : (accountPassword ? (accountPassword.getHint() || '') : '')}
                                onChange={this.oldPasswordChangeHandler}
                            />
                        </div>}
                        {mode === 'change' && <>
                            <div className="tsv-input">
                                <TextField
                                    fullWidth={true}
                                    value={password}
                                    label={i18n.t('settings.2fa.password')}
                                    margin="dense"
                                    variant="outlined"
                                    type="password"
                                    helperText={i18n.t('settings.2fa.password_hint')}
                                    onChange={this.passwordChangeHandler}
                                    error={this.checkPassword()}
                                />
                            </div>
                            <div className="tsv-input">
                                <TextField
                                    fullWidth={true}
                                    value={passwordConfirm}
                                    label={i18n.t('settings.2fa.confirm_password')}
                                    margin="dense"
                                    variant="outlined"
                                    type="password"
                                    onChange={this.passwordConfirmChangeHandler}
                                    error={passwordConfirm !== password}
                                />
                            </div>
                            <div className="tsv-input">
                                <TextField
                                    fullWidth={true}
                                    value={hint}
                                    label={i18n.t('settings.2fa.hint')}
                                    margin="dense"
                                    variant="outlined"
                                    onChange={this.hintChangeHandler}
                                />
                            </div>
                            <div className="tsv-input">
                                <Button color="primary" fullWidth={true}
                                        onClick={this.enableRecoveryHandler}>{i18n.t(securityQuestions.length === 3 ? 'settings.2fa.disable_recovery' : 'settings.2fa.enable_recovery')}</Button>
                            </div>
                        </>}
                        <div className="tsv-gap"/>
                        <DialogActions>
                            <Button color="primary" onClick={this.modalCloseHandler}>
                                {i18n.t('general.cancel')}
                            </Button>
                            <Button color="secondary" autoFocus={true} onClick={this.submitHandler}>
                                {mode === 'change' ? i18n.t('general.submit') : i18n.t('general.deactivate')}
                            </Button>
                        </DialogActions>
                    </div>}
                    {Boolean(step === 3) && <div className="tsv-dialog">
                        <div className="tsv-header">
                            <CheckCircleOutlineRounded/>
                        </div>
                        <div className="tsv-success">
                            {mode === 'change' ? i18n.t('settings.2fa.password_successfully_changed') : i18n.t('settings.2fa.password_successfully_removed')}
                        </div>
                        <div className="tsv-gap"/>
                    </div>}
                </SettingsModal>
                <RecoveryQuestionModal ref={this.recoveryQuestionModalRefHandler}
                                       onDone={this.recoveryQuestionModalDoneHandler}/>
            </>
        );
    }

    private modalCloseHandler = () => {
        clearInterval(this.timeout);
        this.setState({
            accountPassword: undefined,
            hint: '',
            oldPassword: '',
            open: false,
            password: '',
            passwordConfirm: '',
        });
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    private nextPageHandler = (mode: string) => () => {
        this.setState({
            mode,
            step: 2,
        });
    }

    private getAccountPassword() {
        this.sdk.accountGetPassword().then((res) => {
            this.setState({
                accountPassword: res,
            });
        });
    }

    private oldPasswordChangeHandler = (e: any) => {
        this.setState({
            oldPassword: e.target.value,
        });
    }

    private passwordChangeHandler = (e: any) => {
        this.setState({
            password: e.target.value,
        });
    }

    private passwordConfirmChangeHandler = (e: any) => {
        this.setState({
            passwordConfirm: e.target.value,
        });
    }

    private hintChangeHandler = (e: any) => {
        this.setState({
            hint: e.target.value,
        });
    }

    private checkPassword = () => {
        const {hint, password} = this.state;
        if (password.length < 6) {
            return true;
        }
        if (hint !== '' && hint.indexOf(password) > -1) {
            return true;
        }
        return false;
    }

    private submitHandler = () => {
        const {password, passwordConfirm, oldPassword, hint, accountPassword, mode, securityQuestions} = this.state;
        if (!accountPassword) {
            return;
        }
        if (mode === 'change' && this.checkPassword()) {
            return;
        }
        if (mode === 'change' && password !== passwordConfirm) {
            return;
        }
        if (mode === 'remove' && oldPassword.length < 6) {
            return;
        }

        const setPassword = (passHash: Uint8Array | undefined, inputPass?: InputPassword) => {
            this.sdk.accountSetPassword(accountPassword.getAlgorithm() || C_MSG.PasswordAlgorithmVer6A, accountPassword.getAlgorithmdata_asU8(), passHash, hint, securityQuestions, inputPass).then(() => {
                this.setState({
                    hint: '',
                    oldPassword: '',
                    password: '',
                    passwordConfirm: '',
                    securityQuestions: [],
                    step: 3,
                });
                if (this.props.onDone) {
                    this.props.onDone();
                }
                this.timeout = setTimeout(() => {
                    this.modalCloseHandler();
                }, 4000);
            }).catch((err: any) => {
                if (!this.props.onError) {
                    return;
                }
                if (err.code === C_ERR.ErrCodeInvalid && err.items === C_ERR_ITEM.ErrItemPasswordHash) {
                    this.props.onError(i18n.t('settings.2fa.pass_is_incorrect'));
                    this.setState({
                        incorrectPassword: true,
                    });
                }
            });
        };

        const changePassword = (inputPass?: InputPassword) => {
            if (mode === 'change') {
                this.sdk.genSrpHash(password, accountPassword.getAlgorithm() || C_MSG.PasswordAlgorithmVer6A, accountPassword.getAlgorithmdata_asU8()).then((passHash) => {
                    setPassword(passHash, inputPass);
                });
            } else {
                setPassword(undefined, inputPass);
            }
        };

        if (accountPassword.getHaspassword()) {
            this.sdk.genInputPassword(oldPassword, accountPassword).then((inputPassword) => {
                changePassword(inputPassword);
            });
        } else {
            changePassword();
        }
    }

    private recoveryQuestionModalRefHandler = (ref: any) => {
        this.recoveryQuestionModalRef = ref;
    }

    private enableRecoveryHandler = () => {
        const {securityQuestions} = this.state;
        if (securityQuestions.length === 3) {
            this.setState({
                securityQuestions: [],
            });
            return;
        }
        if (!this.recoveryQuestionModalRef) {
            return;
        }
        this.recoveryQuestionModalRef.openDialog(securityQuestions);
    }

    private recoveryQuestionModalDoneHandler = (list: SecurityQuestion.AsObject[]) => {
        this.setState({
            securityQuestions: list,
        }, () => {
            const {mode, accountPassword} = this.state;
            if (mode === 'recover' && accountPassword) {
                this.sdk.accountRecover(accountPassword.getAlgorithm() || C_MSG.PasswordAlgorithmVer6A, accountPassword.getAlgorithmdata_asU8(), accountPassword.getSrpid() || '', list.map(o => {
                    return {
                        answer: o.answer || '',
                        questionid: o.id || 0,
                    };
                })).then(() => {
                    this.setState({
                        hint: '',
                        oldPassword: '',
                        password: '',
                        passwordConfirm: '',
                        securityQuestions: [],
                        step: 3,
                    });
                    if (this.props.onDone) {
                        this.props.onDone();
                    }
                    this.timeout = setTimeout(() => {
                        this.modalCloseHandler();
                    }, 4000);
                }).catch((err: any) => {
                    if (!this.props.onError) {
                        return;
                    }
                    if (err.code === C_ERR.ErrCodeInvalid && (err.items === C_ERR_ITEM.ErrItemSecurityAnswer || err.items === C_ERR_ITEM.ErrItemSecurityQuestion)) {
                        this.props.onError(i18n.t('settings.2fa.security_answer_are_wrong'));
                    }
                });
            }
        });
    }

    private recoverPasswordHandler = () => {
        if (this.state.accountPassword && this.recoveryQuestionModalRef) {
            this.recoveryQuestionModalRef.openDialog(this.state.accountPassword.toObject().questionsList.map(o => {
                    return {
                        answer: '',
                        id: o.id,
                        text: o.text,
                    };
                }
            ), true);
            this.setState({
                mode: 'recover',
            });
        }
    }
}

export default TwoStepVerificationModal;
