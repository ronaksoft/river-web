/*
    Creation Time: 2018 - Oct - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import TimeUtility from '../../services/utilities/time';
import {DoneRounded, DoneAllRounded, ScheduleOutlined, AddRounded} from '@material-ui/icons';
import LabelRepo from "../../repository/label";
import i18n from "../../services/i18n";

import './style.scss';

interface IProps {
    editedTime: number;
    id?: number;
    labelIds?: number[];
    onClick?: (e: any) => void;
    onDoubleClick?: (e: any) => void;
    markAsSent?: boolean;
    readId?: number;
    status: boolean;
    time: number;
    forceDoubleTick: boolean;
}

const GetStatus = ({id, readId, status, forceDoubleTick, markAsSent}: { id: number, readId: number, status: boolean, forceDoubleTick: boolean, markAsSent?: boolean }) => {
    if (id && status) {
        if (id < 0 && !markAsSent) {
            return (<ScheduleOutlined className="icon"/>);
        } else if ((id > 0 && readId >= id) || forceDoubleTick) {
            return (<DoneAllRounded className="icon"/>);
        } else if ((id > 0 && readId < id) || markAsSent) {
            return (<DoneRounded className="icon"/>);
        } else {
            return null;
        }
    } else {
        return null;
    }
};

const GetLabels = ({labelIds}: { labelIds: number[] }) => {
    const labelColors = LabelRepo.labelColors;
    let cnt = 0;
    return (
        <div className={'message-label ' + (labelIds.length > 1 ? 'single-label' : 'many-label')}>
            {labelIds.slice(0, 3).map((id, key) => {
                if (labelColors.hasOwnProperty(id)) {
                    return (<div key={id} className={`circle-label label-${cnt++}`}
                                 style={{backgroundColor: labelColors[id]}}>
                        {key === 0 && labelIds.length > 3 ? <AddRounded/> : ''}
                    </div>);
                }
                return null;
            })}
        </div>
    );
};

/* Prevent propagation on status click */
const onClickHandler = (e: any) => {
    e.stopPropagation();
};

const MessageStatus = ({onClick, onDoubleClick, time, editedTime, forceDoubleTick, id, labelIds, markAsSent, readId, status}: IProps) => {
    return (
        <div className={'message-status'} onClick={onClickHandler} onDoubleClick={onDoubleClick}>
            {labelIds && <GetLabels labelIds={labelIds}/>}
            {editedTime > 0 && <span className="edited">{i18n.t("general.edited")}</span>}
            <span className="time">{TimeUtility.TimeParse(time)}</span>
            <GetStatus id={id || 0} readId={readId || 0} status={status} forceDoubleTick={forceDoubleTick}
                       markAsSent={markAsSent}/>
        </div>
    );
};

export default MessageStatus;
