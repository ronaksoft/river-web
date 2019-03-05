/*
    Creation Time: 2019 - March - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {IMessage} from '../../repository/message/interface';
import {InputPeer} from '../../services/sdk/messages/chat.core.types_pb';
import DocumentViewerService from '../../services/documentViewerService';
import {PlaceRounded} from '@material-ui/icons';

import './style.css';

interface IProps {
    message: IMessage;
    peer: InputPeer | null;
}

interface IState {
    message: IMessage;
}

class MessageLocation extends React.PureComponent<IProps, IState> {
    private lastId: number;
    private documentViewerService: DocumentViewerService;

    constructor(props: IProps) {
        super(props);


        this.state = {
            message: props.message,
        };

        this.documentViewerService = DocumentViewerService.getInstance();
    }

    public componentDidMount() {
        //
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (newProps.message && this.lastId !== newProps.message.id) {
            this.lastId = newProps.message.id || 0;
            this.setState({
                message: newProps.message,
            });
        }
    }

    public componentWillUnmount() {
        //
    }

    /* View downloaded document */
    public viewDocument = () => {
        return;
        // @ts-ignore
        this.documentViewerService.loadDocument({});
    }

    public render() {
        // const {message} = this.state;
        return (
            <div className="message-location">
                <div className="location-content">
                    <PlaceRounded/>
                </div>
            </div>
        );
    }
}

export default MessageLocation;
