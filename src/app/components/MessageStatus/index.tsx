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
import {DoneRounded, DoneAllRounded, ScheduleRounded} from '@material-ui/icons';
import LabelRepo from "../../repository/label";
import i18n from "../../services/i18n";

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

    private labelColors = LabelRepo.labelColors;

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

    public render() {
        const {id, readId, status, time, editedTime} = this.state;
        return (
            <div className={'message-status'} onClick={this.onClickHandler} onDoubleClick={this.onDoubleClickHandler}>
                {this.getLabels()}
                {editedTime > 0 && <span className="edited">{i18n.t("general.edited")}</span>}
                <span className="time">{TimeUtility.TimeParse(time)}</span>
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

    private getLabels() {
        const {labelIds} = this.state;
        if (labelIds.length === 0) {
            return;
        }
        return (
            <div className={'message-label ' + (labelIds.length > 1 ? 'single-label' : 'many-label')}>
                {labelIds.slice(0, 3).map((id, key) => {
                    return (<div key={id} className={`circle-label label-${key}`} style={{backgroundColor: this.labelColors[id]}}/>);
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
