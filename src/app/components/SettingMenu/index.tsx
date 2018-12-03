import * as React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import MobileStepper from '@material-ui/core/MobileStepper';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import {
    KeyboardBackspaceRounded,
    PaletteRounded,
    FaceRounded,
    EditRounded,
    CheckRounded,
} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import UserAvatar from '../UserAvatar';
import TextField from '@material-ui/core/TextField/TextField';
import {IContact} from '../../repository/contact/interface';

import './style.css';
import UserRepo from '../../repository/user';
import SDK from '../../services/sdk';

interface IProps {
    id?: number;
    onClose?: () => void;
    readId?: number;
    updateMessages?: () => void;
}

interface IState {
    checked: boolean;
    edit: boolean;
    firstname: string;
    fontSize: number;
    id: number;
    lastname: string;
    page: string;
    pageContent: string;
    phone: string;
    readId: number;
    user: IContact | null;
    username: string;
}

class SettingMenu extends React.Component<IProps, IState> {
    private userRepo: UserRepo;
    private sdk: SDK;
    private userId: string;

    constructor(props: IProps) {
        super(props);

        this.sdk = SDK.getInstance();
        this.userId = this.sdk.getConnInfo().UserID || '';

        this.state = {
            checked: false,
            edit: false,
            firstname: '',
            fontSize: 2,
            id: props.id || 0,
            lastname: '',
            page: '1',
            pageContent: 'none',
            phone: this.sdk.getConnInfo().Phone || '',
            readId: props.readId || 0,
            user: null,
            username: '',
        };

        this.userRepo = UserRepo.getInstance();
    }

    public componentDidMount() {
        const el = document.querySelector('html');
        if (!el) {
            return;
        }
        this.setState({
            checked: (el.getAttribute('theme') === 'dark'),
            fontSize: parseInt(el.getAttribute('font') || '2', 10),
        });

        this.userRepo.get(this.userId).then((res) => {
            this.setState({
                firstname: res.firstname || '',
                lastname: res.lastname || '',
                user: res,
                username: res.username || '',
            });
        });
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            id: newProps.id || 0,
            readId: newProps.readId || 0,
        });
    }

    public render() {
        const {page, pageContent, user, edit, firstname, lastname, phone, username} = this.state;
        return (
            <div className="setting-menu">
                <div className={'page-container page-' + page}>
                    <div className="page page-1">
                        <div className="menu-header">
                            <IconButton
                                aria-label="Close"
                                aria-haspopup="true"
                                onClick={this.props.onClose}
                            >
                                <KeyboardBackspaceRounded/>
                            </IconButton>
                            <label>Settings</label>
                        </div>
                        <div className="menu-content">
                            <FormControlLabel className="setting-switch-label" control={
                                <Switch
                                    checked={this.state.checked}
                                    className="setting-switch"
                                    color="default"
                                    onChange={this.nightModeHandler}
                                />
                            } label="Night mode"/>
                            <div className="page-anchor" onClick={this.accountPageHandler}>
                                <FaceRounded/> Account
                            </div>
                            <div className="page-anchor" onClick={this.themePageHandler}>
                                <PaletteRounded/> Theme
                            </div>
                        </div>
                    </div>
                    <div className="page page-2">
                        {Boolean(pageContent === 'theme') && <div>
                            <div className="menu-header">
                                <IconButton
                                    aria-label="Prev"
                                    aria-haspopup="true"
                                    onClick={this.onPrevHandler}
                                >
                                    <KeyboardBackspaceRounded/>
                                </IconButton>
                                <label>Theme</label>
                            </div>
                            <div className="menu-content">
                                <FormControlLabel className="setting-switch-label" control={
                                    <Switch
                                        checked={this.state.checked}
                                        className="setting-switch"
                                        color="default"
                                        onChange={this.nightModeHandler}
                                    />
                                } label="Night mode"/>
                                <label className="font-size-label">Font Size</label>
                                <MobileStepper
                                    variant="progress"
                                    steps={6}
                                    position="static"
                                    activeStep={this.state.fontSize}
                                    className="font-size-container"
                                    nextButton={
                                        <Button size="small" onClick={this.handleNext}
                                                disabled={this.state.fontSize === 5}>
                                            <KeyboardArrowRight/>
                                        </Button>
                                    }
                                    backButton={
                                        <Button size="small" onClick={this.handleBack}
                                                disabled={this.state.fontSize === 0}>
                                            <KeyboardArrowLeft/>
                                        </Button>
                                    }
                                />
                            </div>
                        </div>}
                        {Boolean(pageContent === 'account') && <div>
                            <div className="menu-header">
                                <IconButton
                                    aria-label="Prev"
                                    aria-haspopup="true"
                                    onClick={this.onPrevHandler}
                                >
                                    <KeyboardBackspaceRounded/>
                                </IconButton>
                                <label>Account</label>
                            </div>
                            {user && <div className="info kk-card">
                                <div className="avatar">
                                    <UserAvatar id={user.id || ''}/>
                                </div>
                                <div className="line">
                                    {!edit && <div className="form-control">
                                        <label>First Name</label>
                                        <div className="inner">{user.firstname}</div>
                                        <div className="action">
                                            <IconButton
                                                aria-label="Edit title"
                                                onClick={this.onEditHandler}
                                            >
                                                <EditRounded/>
                                            </IconButton>
                                        </div>
                                    </div>}
                                    {edit &&
                                    <TextField
                                        label="First Name"
                                        fullWidth={true}
                                        inputProps={{
                                            maxLength: 32,
                                        }}
                                        value={firstname}
                                        className="input-edit"
                                        onChange={this.onFirstnameChangeHandler}
                                    />}
                                </div>
                                <div className="line">
                                    {!edit && <div className="form-control">
                                        <label>Last Name</label>
                                        <div className="inner">{user.lastname}</div>
                                        <div className="action">
                                            <IconButton
                                                aria-label="Edit title"
                                                onClick={this.onEditHandler}
                                            >
                                                <EditRounded/>
                                            </IconButton>
                                        </div>
                                    </div>}
                                    {edit &&
                                    <TextField
                                        label="Last Name"
                                        fullWidth={true}
                                        inputProps={{
                                            maxLength: 32,
                                        }}
                                        value={lastname}
                                        className="input-edit"
                                        onChange={this.onLastnameChangeHandler}
                                    />}
                                </div>
                                <div className="line">
                                    {!edit && <div className="form-control">
                                        <label>Username</label>
                                        <div className="inner">{user.username}</div>
                                        <div className="action">
                                            <IconButton
                                                aria-label="Edit title"
                                                onClick={this.onEditHandler}
                                            >
                                                <EditRounded/>
                                            </IconButton>
                                        </div>
                                    </div>}
                                    {edit &&
                                    <TextField
                                        label="Username"
                                        fullWidth={true}
                                        inputProps={{
                                            maxLength: 32,
                                        }}
                                        value={username}
                                        className="input-edit"
                                        onChange={this.onUsernameChangeHandler}
                                    />}
                                </div>
                                <div className="line">
                                    <div className="form-control pad">
                                        <label>phone</label>
                                        <div className="inner">{phone}</div>
                                    </div>
                                </div>
                                {Boolean(edit && user && ((user.firstname !== firstname || user.lastname !== lastname || user.username !== username))) &&
                                <div className="actions-bar">
                                    <div className="add-action" onClick={this.confirmChangesHandler}>
                                        <CheckRounded/>
                                    </div>
                                </div>}
                            </div>}
                        </div>}
                    </div>
                </div>
            </div>
        );
    }

    private nightModeHandler = (e: any) => {
        const el = document.querySelector('html');
        if (!el) {
            return;
        }
        if (e.target.checked) {
            el.setAttribute('theme', 'dark');
            localStorage.setItem('river.theme.color', 'dark');
        } else {
            el.setAttribute('theme', 'light');
            localStorage.setItem('river.theme.color', 'light');
        }
        this.setState({
            checked: e.target.checked,
        });
    }

    private handleNext = () => {
        this.setState(state => ({
            fontSize: state.fontSize + 1,
        }), () => {
            this.changeFontSize();
        });
    }

    private handleBack = () => {
        this.setState(state => ({
            fontSize: state.fontSize - 1,
        }), () => {
            this.changeFontSize();
        });
    }

    private changeFontSize() {
        const el = document.querySelector('html');
        if (!el) {
            return;
        }
        localStorage.setItem('river.theme.font', String(this.state.fontSize));
        el.setAttribute('font', String(this.state.fontSize));
        if (this.props.updateMessages) {
            this.props.updateMessages();
        }
    }

    private onPrevHandler = () => {
        this.setState({
            edit: false,
            page: '1',
            pageContent: 'none',
        });
    }

    private themePageHandler = () => {
        this.setState({
            page: '2',
            pageContent: 'theme',
        });
    }

    private accountPageHandler = () => {
        this.setState({
            page: '2',
            pageContent: 'account',
        });
    }

    private onEditHandler = () => {
        this.setState({
            edit: true,
        });
    }

    private onFirstnameChangeHandler = (e: any) => {
        this.setState({
            firstname: e.currentTarget.value,
        });
    }

    private onLastnameChangeHandler = (e: any) => {
        this.setState({
            lastname: e.currentTarget.value,
        });
    }

    private onUsernameChangeHandler = (e: any) => {
        this.setState({
            username: e.currentTarget.value,
        });
    }

    private confirmChangesHandler = () => {
        window.console.log('erfe');
    }
}

export default SettingMenu;
