import * as React from 'react';
import {Picker} from 'emoji-mart';
import Menu from '@material-ui/core/Menu';
import Fade from '@material-ui/core/Fade';

import 'emoji-mart/css/emoji-mart.css';
import './style.css';

interface IProps {
    anchorEl: any;
    onSelect?: (data: any) => void;
    onClose?: (event: any) => void;
}

interface IState {
    anchorEl: any;
}

class Emoji extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            anchorEl: props.anchorEl,
        };
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            anchorEl: newProps.anchorEl,
        });
    }

    public render() {
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);
        return (
            <Menu
                id="emoji-menu"
                TransitionComponent={Fade}
                open={open}
                anchorEl={anchorEl}
                onClose={this.onClose}
            >
                <Picker custom={[]} onSelect={this.addEmoji} showPreview={false}/>
            </Menu>
        );
    }

    private addEmoji = (data: any) => {
        this.setState({
            anchorEl: null,
        });
        if (typeof this.props.onSelect === 'function') {
            this.props.onSelect(data);
        }
    }

    private onClose = (event: any) => {
        this.setState({
            anchorEl: null,
        });
        if (typeof this.props.onClose === 'function') {
            this.props.onClose(event);
        }
    }
}

export default Emoji;