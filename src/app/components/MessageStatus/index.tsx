/*
    Creation Time: 2018 - Oct - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import TimeUtililty from '../../services/utilities/time';
import {DoneRounded, DoneAllRounded, ScheduleRounded} from '@material-ui/icons';

import './style.css';

interface IProps {
    editedTime: number;
    id?: number;
    onDoubleClick?: (e: any) => void;
    readId?: number;
    status: boolean;
    time: number;
}

interface IState {
    editedTime: number;
    id: number;
    readId: number;
    status: boolean;
    time: number;
}

class MessageStatus extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            editedTime: props.editedTime,
            id: props.id || 0,
            readId: props.readId || 0,
            status: props.status,
            time: props.time,
        };
    }

    // public componentDidMount() {
    // }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            editedTime: newProps.editedTime || 0,
            id: newProps.id || 0,
            readId: newProps.readId || 0,
            status: newProps.status,
        });
    }

    public render() {
        const {id, readId, status, time, editedTime} = this.state;

        return (
            <div className={'message-status'} onClick={this.onClickHandler} onDoubleClick={this.onDoubleClickHandler}>
                {editedTime > 0 && <span className="edited">edited</span>}
                <span className="time">{TimeUtililty.TimeParse(time)}</span>
                {this.getStatus(id, readId, status)}
            </div>
        );
    }

    private getStatus(id: number, readId: number, status: boolean) {
        if (id && status) {
            if (id < 0) {
                return (<ScheduleRounded className="icon"/>);
            } else if (id > 0 && readId >= id) {
                return (<DoneAllRounded className="icon"/>);
            } else if (id > 0 && readId < id) {
                return (<DoneRounded className="icon"/>);
            } else {
                return '';
            }
        } else {
            return '';
        }
    }

    private onDoubleClickHandler = (e: any) => {
        if (this.props.onDoubleClick) {
            this.props.onDoubleClick(e);
        }
    }

    /* Prevent propagation on status click */
    private onClickHandler = (e: any) => {
        e.stopPropagation();
    }
}

export default MessageStatus;
