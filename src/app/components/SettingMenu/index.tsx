import * as React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import './style.css';

interface IProps {
    id?: number;
    readId?: number;
}

interface IState {
    id: number;
    readId: number;
}

class SettingMenu extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            id: props.id || 0,
            readId: props.readId || 0,
        };
    }

    // public componentDidMount() {
    // }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            id: newProps.id || 0,
            readId: newProps.readId || 0,
        });
    }

    public render() {
        return (
            <div className="setting-menu">
                <FormControlLabel control={
                    <Switch
                        value="checkedC"
                        color="default"
                        onChange={this.nightModeHandler}
                    />
                } label="Night mode" />
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
        } else {
            el.setAttribute('theme', 'light');
        }
    }
}

export default SettingMenu;