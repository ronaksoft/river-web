/*
    Creation Time: 2018 - Oct - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import TimeUtility from '../../services/utilities/time';
import {DoneRounded, DoneAllRounded, ScheduleRounded, LabelRounded} from '@material-ui/icons';

import './style.scss';

interface IProps {
    editedTime: number;
    id?: number;
    labelIds?: number[];
    onDoubleClick?: (e: any) => void;
    readId?: number;
    status: boolean;
    time: number;
}

interface IState {
    editedTime: number;
    id: number;
    labelIds: number[];
    readId: number;
    status: boolean;
    time: number;
}

class MessageStatus extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(newProps: IProps, state: IState) {
        return {
            editedTime: newProps.editedTime || 0,
            id: newProps.id || 0,
            labelIds: newProps.labelIds || [],
            readId: newProps.readId || 0,
            status: newProps.status,
        };
    }

    constructor(props: IProps) {
        super(props);

        this.state = {
            editedTime: props.editedTime,
            id: props.id || 0,
            labelIds: props.labelIds || [],
            readId: props.readId || 0,
            status: props.status,
            time: props.time,
        };
    }

    // public componentDidMount() {
    // }

    public render() {
        const {id, readId, status, time, editedTime} = this.state;

        return (
            <div className={'message-status'} onClick={this.onClickHandler} onDoubleClick={this.onDoubleClickHandler}>
                {editedTime > 0 && <span className="edited">edited</span>}
                <span className="time">{TimeUtility.TimeParse(time)}</span>
                {this.getStatus(id, readId, status)}
                {this.getLabels()}
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

    private getLabels() {
        const {labelIds} = this.state;
        return (
            <div className="message-label">
                {labelIds.slice(0, 2).map((id, key) => {
                    return (<LabelRounded key={id} className={`label-${key}`}/>);
                })}
            </div>
        );
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
