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
import {DoneRounded, DoneAllRounded, ScheduleRounded, AddRounded} from '@material-ui/icons';
import LabelRepo from "../../repository/label";
import i18n from "../../services/i18n";

import './style.scss';

interface IProps {
    editedTime: number;
    id?: number;
    labelIds?: number[];
    onDoubleClick?: (e: any) => void;
    markAsSent?: boolean;
    readId?: number;
    status: boolean;
    time: number;
    forceDoubleTick: boolean;
}

interface IState {
    editedTime: number;
    id: number;
    labelIds: number[];
    markAsSent?: boolean;
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
            markAsSent: newProps.markAsSent,
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
        const {id, readId, status, time, editedTime, markAsSent} = this.state;
        return (
            <div className={'message-status'} onClick={this.onClickHandler} onDoubleClick={this.onDoubleClickHandler}>
                {this.getLabels()}
                {editedTime > 0 && <span className="edited">{i18n.t("general.edited")}</span>}
                <span className="time">{TimeUtility.TimeParse(time)}</span>
                {this.getStatus(id, readId, status, markAsSent)}
            </div>
        );
    }

    private getStatus(id: number, readId: number, status: boolean, markAsSent?: boolean) {
        if (id && status) {
            if (id < 0 && !markAsSent) {
                return (<ScheduleRounded className="icon"/>);
            } else if ((id > 0 && readId >= id) || this.props.forceDoubleTick) {
                return (<DoneAllRounded className="icon"/>);
            } else if ((id > 0 && readId < id) || markAsSent) {
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
        let cnt = 0;
        return (
            <div className={'message-label ' + (labelIds.length > 1 ? 'single-label' : 'many-label')}>
                {labelIds.slice(0, 3).map((id, key) => {
                    if (this.labelColors.hasOwnProperty(id)) {
                        return (<div key={id} className={`circle-label label-${cnt++}`}
                                     style={{backgroundColor: this.labelColors[id]}}>
                            {key === 0 && labelIds.length > 3 ? <AddRounded/> : ''}
                        </div>);
                    }
                    return '';
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
