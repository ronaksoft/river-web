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
import {CheckCircleOutlineRounded, SimCardRounded} from '@material-ui/icons';
import i18n from '../../services/i18n';
import ChangePhone from "../SVG/change_phone";
import Button from '@material-ui/core/Button';
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import TextField from "@material-ui/core/TextField/TextField";
import SDK from "../../services/sdk";
import {AccountPassword} from "../../services/sdk/messages/chat.api.accounts_pb";
// @ts-ignore
import IntlTelInput from 'react-intl-tel-input';
import {codeLen, codePlaceholder} from "../../pages/SignUp";
import {modifyCode} from "../../pages/SignUp/utils";
import UserRepo from "../../repository/user";
import {C_ERR, C_ERR_ITEM} from "../../services/sdk/const";
import {InputPassword} from "../../services/sdk/messages/chat.core.types_pb";

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
    phoneHash: string;
    password: string;
}

class ChangePhoneModal extends React.Component<IProps, IState> {
    private sdk: SDK;
    private timeout: any = null;
    private userRepo: UserRepo;

    constructor(props: IProps) {
        super(props);

        this.state = {
            code: codePlaceholder,
            open: false,
            password: '',
            phone: '',
            phoneHash: '',
            step: 1,
        };

        this.sdk = SDK.getInstance();
        this.userRepo = UserRepo.getInstance();
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
            <SettingsModal open={open} title={i18n.t('settings.change_phone_number.title')}
                           icon={<SimCardRounded/>}
                           onClose={this.modalCloseHandler}
                           height="340px"
                           noScrollbar={true}
            >
                {Boolean(step === 1) && <div className="change-phone-dialog">
                    <div className="change-phone-header">
                        <ChangePhone/>
                    </div>
                    <div className="change-phone-text">{i18n.t('settings.change_phone_number.text')}</div>
                    <div className="change-phone-text">
                        <b>{i18n.t('settings.change_phone_number.important')}</b>{i18n.t('settings.change_phone_number.note')}
                    </div>
                    <DialogActions>
                        <Button color="primary" onClick={this.modalCloseHandler}>
                            {i18n.t('general.cancel')}
                        </Button>
                        <Button color="secondary" autoFocus={true} onClick={this.nextPageHandler}>
                            {i18n.t('general.change')}
                        </Button>
                    </DialogActions>
                </div>}
                {Boolean(step === 2) && <div className="change-phone-dialog">
                    <div className="change-phone-input phone-number">
                        <IntlTelInput preferredCountries={[]}
                                      defaultCountry={'ir'}
                                      value={phone}
                                      autoHideDialCode={false}
                                      onPhoneNumberChange={this.phoneChangeHandler}
                                      nationalMode={false}
                                      fieldId="input-phone"
                                      placeholder={i18n.t('settings.change_phone_number.enter_new_number')}
                        />
                    </div>
                    <div className="change-phone-text">
                        {i18n.t('settings.change_phone_number.note_2')}
                    </div>
                    {Boolean(accountPassword && accountPassword.getHaspassword()) && <>
                        <div className="change-phone-input">
                            <TextField
                                fullWidth={true}
                                value={password}
                                label={i18n.t('settings.change_phone_number.enter_password')}
                                margin="dense"
                                variant="outlined"
                                helperText={accountPassword ? (accountPassword.getHint() as string || '') : ''}
                                onChange={this.passwordChangeHandler}
                            />
                        </div>
                        <div className="change-phone-text">
                            {i18n.t('settings.change_phone_number.note_2fa')}
                        </div>
                    </>}
                    <div className="change-phone-gap"/>
                    <DialogActions>
                        <Button color="primary" onClick={this.modalCloseHandler}>
                            {i18n.t('general.cancel')}
                        </Button>
                        <Button color="secondary" autoFocus={true} onClick={this.sendCodeHandler}>
                            {i18n.t('general.next')}
                        </Button>
                    </DialogActions>
                </div>}
                {Boolean(step === 3 || step === 4) && <div className="change-phone-dialog">
                    {Boolean(step === 3) && <div className="change-phone-input">
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
                    <div className="change-phone-header">
                        <ChangePhone/>
                    </div>
                    {Boolean(step === 4) && <div className="tsv-header">
                        <CheckCircleOutlineRounded/>
                    </div>}
                    {Boolean(step === 4) && <div className="change-phone-success">
                        {i18n.tf('settings.change_phone_number.phone_number_changed', phone)}
                    </div>}
                    <div className="change-phone-gap"/>
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
        this.sdk.accountGetPassword().then((res) => {
            this.setState({
                accountPassword: res,
            });
        });
    }

    private phoneChangeHandler = (e: any, value: any) => {
        this.setState({
            phone: value,
        });
    }

    private passwordChangeHandler = (e: any) => {
        this.setState({
            password: e.target.value,
        });
    }

    private codeChangeHandler = (e: any) => {
        const data = modifyCode(e.target.value);
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
        this.sdk.accountSendChangePhoneCode(phone).then((res) => {
            this.setState({
                phone: res.phone || '',
                phoneHash: res.phonecodehash || '',
                step: step + 1,
            });
        });
    }

    private submitHandler = () => {
        const {code, phone, phoneHash, accountPassword, password} = this.state;
        if (phone === '' || phoneHash === '' || code.length < codeLen) {
            return;
        }
        const changeNumber = (inputPass?: InputPassword) => {
            this.sdk.accountChangeNumber(phone, code, phoneHash, inputPass).then((res) => {
                this.setState({
                    step: 4,
                });
                this.userRepo.importBulk(false, [{
                    id: this.userRepo.getCurrentUserId(),
                    phone,
                }]);
                const connInfo = this.sdk.getConnInfo();
                connInfo.Phone = phone;
                this.sdk.setConnInfo(connInfo);
                this.timeout = setTimeout(() => {
                    this.modalCloseHandler();
                }, 4000);
                if (this.props.onDone) {
                    this.props.onDone();
                }
            }).catch((err) => {
                if (!this.props.onError) {
                    return;
                }
                if (err.code === C_ERR.ErrCodeInvalid && err.items === C_ERR_ITEM.ErrItemPhoneCode) {
                    this.props.onError(i18n.t('sign_up.code_is_incorrect'));
                } else if (err.code === C_ERR.ErrCodeInvalid && err.items === C_ERR_ITEM.ErrItemPasswordHash) {
                    this.props.onError(i18n.t('settings.2fa.pass_is_incorrect'));
                } else if (err.code === C_ERR.ErrCodeAlreadyExists && err.items === C_ERR_ITEM.ErrItemPhone) {
                    this.props.onError(i18n.t('settings.change_phone_number.phone_already_exists'));
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
        }
        if (accountPassword && accountPassword.getHaspassword()) {
            this.sdk.genInputPassword(password, accountPassword).then((inputPassword) => {
                changeNumber(inputPassword);
            });
        } else {
            changeNumber();
        }
    }
}

export default ChangePhoneModal;
