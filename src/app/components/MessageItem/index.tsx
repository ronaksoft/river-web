import * as React from 'react';
import {IMessage} from '../../repository/message/interface';
import {InputPeer} from '../../services/sdk/messages/core.types_pb';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';
import UserAvatar from '../UserAvatar';
import MessagePreview from '../MessagePreview';
import MessageStatus from '../MessageStatus';
import {MoreVert} from '@material-ui/icons';
import TimeUtility from '../../services/utilities/time';

import './style.css';

interface IProps {
    index: number;
    message: IMessage;
    peer: InputPeer | null;
    readId: number;
    style: any;
    moreCmdHandler: (cmd: string, index: number, e: any) => void;
    contextMenuHandler: (index: number, e: any) => void;
}

interface IState {
    index: number;
    message: IMessage;
    peer: InputPeer | null;
    readId: number;
    style: any;
}

class MessageItem extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            index: props.index,
            message: props.message,
            peer: props.peer,
            readId: props.readId,
            style: props.style,
        };
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            index: newProps.index,
            message: newProps.message,
            peer: newProps.peer,
            readId: newProps.readId,
            style: newProps.style,
        });
    }

    public render() {
        const {index, message, peer, readId, style} = this.state;

        switch (message.type) {
            case C_MESSAGE_TYPE.Date:
                return (
                    <div style={style} className="bubble-wrapper">
                        <span className="date">{TimeUtility.dynamicDate(message.createdon || 0)}</span>
                    </div>
                );
            case C_MESSAGE_TYPE.Normal:
            default:
                return (
                    <div style={style}
                         className={'bubble-wrapper ' + (message.me ? 'me' : 'you') + (message.avatar ? ' avatar' : '')}>
                        {(message.avatar && message.senderid && !message.me) && (
                            <UserAvatar id={message.senderid} className="avatar"/>
                        )}
                        {(message.avatar && message.senderid) && (<div className="arrow"/>)}
                        <div className={'bubble b_' + message.id + ((message.editedon || 0) > 0 ? ' edited' : '')}
                             onDoubleClick={this.props.moreCmdHandler.bind(this, 'reply', index)}>
                            {Boolean(message.replyto && message.replyto !== 0) &&
                            <MessagePreview message={message} peer={peer}/>}
                            <div className={'inner ' + (message.rtl ? 'rtl' : 'ltr')}
                                 dangerouslySetInnerHTML={{__html: this.formatText(message.body)}}/>
                            <MessageStatus status={message.me || false} id={message.id} readId={readId}
                                           time={message.createdon || 0} editedTime={message.editedon || 0}/>
                            <div className="more" onClick={this.props.contextMenuHandler.bind(this, index)}>
                                <MoreVert/>
                            </div>
                        </div>
                    </div>
                );
        }
    }

    private formatText(text: string | undefined) {
        text = text || '';
        return text.split('\n').join('<br/>');
    }
}

export default MessageItem;
