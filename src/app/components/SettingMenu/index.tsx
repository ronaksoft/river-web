import * as React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import MobileStepper from '@material-ui/core/MobileStepper';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

import './style.css';

interface IProps {
    id?: number;
    readId?: number;
    updateMessages?: () => void;
}

interface IState {
    checked: boolean;
    fontSize: number;
    id: number;
    readId: number;
}

class SettingMenu extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            checked: false,
            fontSize: 2,
            id: props.id || 0,
            readId: props.readId || 0,
        };
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
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            id: newProps.id || 0,
            readId: newProps.readId || 0,
        });
    }

    public render() {
        return (
            <div className="setting-menu">
                <div className="menu-header">
                    <label>Contacts</label>
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
                            <Button size="small" onClick={this.handleNext} disabled={this.state.fontSize === 5}>
                                <KeyboardArrowRight/>
                            </Button>
                        }
                        backButton={
                            <Button size="small" onClick={this.handleBack} disabled={this.state.fontSize === 0}>
                                <KeyboardArrowLeft/>
                            </Button>
                        }
                    />
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
}

export default SettingMenu;
