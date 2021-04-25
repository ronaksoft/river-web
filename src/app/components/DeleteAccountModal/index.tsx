/*
    Creation Time: 2020 - Jan - 14
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
import SettingsModal from '../SettingsModal';
import {PersonOffRounded} from '@material-ui/icons';
import i18n from '../../services/i18n';
import Button from '@material-ui/core/Button';
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import TextField from "@material-ui/core/TextField/TextField";
import APIManager from "../../services/sdk";
import {AccountPassword} from "../../services/sdk/messages/accounts_pb";
// @ts-ignore
import IntlTelInput from 'react-intl-tel-input';
import {codeLen, codePlaceholder} from "../../pages/SignUp";
import {modifyCode} from "../../pages/SignUp/utils";
import {C_ERR, C_ERR_ITEM} from "../../services/sdk/const";
import {InputPassword} from "../../services/sdk/messages/core.types_pb";
import {extractPhoneNumber, faToEn} from "../../services/utilities/localize";
import {DeletedUserDark} from "../UserAvatar/svg";

import './style.scss';

interface IProps {
    onClose?: () => void;
    onError?: (message: string) => void;
    onDone?: () => void;
}

interface IState {
    accountPassword?: AccountPassword;
    code: string;
    open: boolean;
    step: number;
    phone: string;
    phoneError: boolean;
    phoneHash: string;
    password: string;
}

class DeleteAccountModal extends React.Component<IProps, IState> {
    private apiManager: APIManager;
    private timeout: any = null;

    constructor(props: IProps) {
        super(props);

        this.apiManager = APIManager.getInstance();

        this.state = {
            code: codePlaceholder,
            open: false,
            password: '',
            phone: this.apiManager.getConnInfo().Phone || '',
            phoneError: false,
            phoneHash: '',
            step: 0,
        };
    }

    public openDialog() {
        this.setState({
            open: true,
        });
    }

    public componentWillUnmount() {
        clearInterval(this.timeout);
    }

    public render() {
        const {open, step, accountPassword, phone, password, code} = this.state;
        return (
            <SettingsModal open={open} title={i18n.t('settings.delete_account.title')}
                           icon={<PersonOffRounded/>}
                           onClose={this.modalCloseHandler}
                           height="340px"
                           noScrollbar={true}
            >
                {Boolean(step === 1) && <div className="delete-account-dialog">
                    <div className="delete-account-header">
                        <DeletedUserDark/>
                    </div>
                    <div className="delete-account-text">{i18n.t('settings.delete_account.text')}</div>
                    <div className="delete-account-text">
                        <b>{i18n.t('settings.delete_account.important')}</b>{i18n.tf('settings.delete_account.note', phone)}
                    </div>
                    <DialogActions>
                        <Button color="primary" onClick={this.modalCloseHandler}>
                            {i18n.t('general.cancel')}
                        </Button>
                        <Button color="secondary" autoFocus={true} onClick={this.nextPageHandler}>
                            {i18n.t('general.continue')}
                        </Button>
                    </DialogActions>
                </div>}
                {Boolean(step === 2) && <div className="delete-account-dialog">
                    <div className={`delete-account-input phone-number ${this.state.phoneError ? 'has-error' : ''}`}>
                        <IntlTelInput preferredCountries={[]}
                                      defaultCountry={'ir'}
                                      value={phone}
                                      autoHideDialCode={false}
                                      onPhoneNumberChange={this.phoneChangeHandler}
                                      nationalMode={false}
                                      disabled={true}
                                      fieldId="input-phone"
                                      placeholder={i18n.t('settings.change_phone_number.enter_new_number')}
                        />
                    </div>
                    <div className="delete-account-text">
                        {i18n.tf('settings.delete_account.note', phone)}
                    </div>
                    {Boolean(accountPassword && accountPassword.getHaspassword()) && <>
                        <div className="delete-account-input">
                            <TextField
                                fullWidth={true}
                                value={password}
                                label={i18n.t('settings.delete_account.enter_password')}
                                margin="dense"
                                variant="outlined"
                                helperText={accountPassword ? (accountPassword.getHint() as string || '') : ''}
                                onChange={this.passwordChangeHandler}
                            />
                        </div>
                        <div className="delete-account-text">
                            {i18n.t('settings.delete_account.note_2fa')}
                        </div>
                    </>}
                    <div className="delete-account-gap"/>
                    <DialogActions>
                        <Button color="primary" onClick={this.modalCloseHandler}>
                            {i18n.t('general.cancel')}
                        </Button>
                        <Button color="secondary" autoFocus={true} onClick={this.sendCodeHandler}>
                            {i18n.t('general.next')}
                        </Button>
                    </DialogActions>
                </div>}
                {Boolean(step === 3 || step === 4) && <div className="delete-account-dialog">
                    {Boolean(step === 3) && <div className="delete-account-input">
                        <TextField
                            label={i18n.t('sign_up.code')}
                            placeholder={codePlaceholder}
                            margin="dense"
                            variant="outlined"
                            className="code f-code text-input"
                            type="text"
                            fullWidth={true}
                            value={code}
                            onChange={this.codeChangeHandler}
                            onKeyDown={this.confirmKeyDown}
                        />
                    </div>}
                    <div className={'delete-account-header' + (step === 4 ? ' big' : '')}>
                        <DeletedUserDark/>
                    </div>
                    {Boolean(step === 4) && <div className="delete-account-success">
                        {i18n.t('settings.delete_account.account_deleted')}
                    </div>}
                    <div className="delete-account-gap"/>
                    {Boolean(step === 3) && <DialogActions>
                        <Button color="primary" onClick={this.modalCloseHandler}>
                            {i18n.t('general.cancel')}
                        </Button>
                        <Button color="secondary" autoFocus={true} onClick={this.submitHandler}>
                            {i18n.t('general.submit')}
                        </Button>
                    </DialogActions>}
                </div>}
            </SettingsModal>
        );
    }

    private modalCloseHandler = () => {
        clearInterval(this.timeout);
        this.setState({
            accountPassword: undefined,
            code: codePlaceholder,
            open: false,
            password: '',
            phone: '',
            phoneHash: '',
            step: 1,
        });
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    private nextPageHandler = () => {
        const {step} = this.state;
        this.setState({
            step: step + 1,
        });
        if (step === 1) {
            this.getAccountPassword();
        }
    }

    private getAccountPassword() {
        this.apiManager.accountGetPassword().then((res) => {
            this.setState({
                accountPassword: res,
            });
        });
    }

    private phoneChangeHandler = (e: any, value: any) => {
        let phone = faToEn(value);
        if (phone.indexOf('09') === 0) {
            phone = phone.replace('09', `+989`);
        }
        this.setState({
            phone: extractPhoneNumber(phone),
            phoneError: false,
        });
    }

    private passwordChangeHandler = (e: any) => {
        this.setState({
            password: e.target.value,
        });
    }

    private codeChangeHandler = (e: any) => {
        const data = modifyCode(faToEn(e.target.value));
        this.setState({
            code: data.code,
        });
    }

    private confirmKeyDown = (e: any) => {
        if (e.key === 'Backspace') {
            e.stopPropagation();
            e.preventDefault();
            const data = modifyCode(this.state.code, true);
            this.setState({
                code: data.code,
            });
        } else if (e.key === 'Enter') {
            this.submitHandler();
        }
    }

    private sendCodeHandler = () => {
        const {phone, step} = this.state;
        if (phone === '') {
            return;
        }
        this.apiManager.accountSendVerifyPhoneCode(phone, "").then((res) => {
            this.setState({
                phone: res.phone || '',
                phoneHash: res.phonecodehash || '',
                step: step + 1,
            });
        }).catch((err) => {
            this.setState({
                phoneError: true,
            });
        });
    }

    private submitHandler = () => {
        const {code, phone, phoneHash, accountPassword, password} = this.state;
        if (phone === '' || phoneHash === '' || code.length < codeLen) {
            return;
        }
        const deleteAccount = (inputPass?: InputPassword) => {
            this.apiManager.accountDelete(phone, code, phoneHash, inputPass).then((res) => {
                this.setState({
                    step: 4,
                });
                this.timeout = setTimeout(() => {
                    this.modalCloseHandler();
                }, 4000);
                if (this.props.onDone) {
                    this.props.onDone();
                }
            }).catch((err) => {
                if (err.code === C_ERR.ErrCodeInvalid && err.items === C_ERR_ITEM.ErrItemPhoneCode) {
                    if (this.props.onError) {
                        this.props.onError(i18n.t('sign_up.code_is_incorrect'));
                    }
                } else if (err.code === C_ERR.ErrCodeInvalid && err.items === C_ERR_ITEM.ErrItemPasswordHash) {
                    if (this.props.onError) {
                        this.props.onError(i18n.t('settings.2fa.pass_is_incorrect'));
                    }
                } else {
                    this.setState({
                        accountPassword: undefined,
                        code: codePlaceholder,
                        open: false,
                        password: '',
                        phone: '',
                        phoneHash: '',
                        step: 2,
                    });
                }
            });
        };

        if (accountPassword && accountPassword.getHaspassword()) {
            this.apiManager.genInputPassword(password, accountPassword).then((inputPassword) => {
                deleteAccount(inputPassword);
            });
        } else {
            deleteAccount();
        }
    }
}

export default DeleteAccountModal;
