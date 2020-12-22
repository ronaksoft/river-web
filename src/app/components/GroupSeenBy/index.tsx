/*
    Creation Time: 2020 - Sep - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
import {VisibilityRounded} from '@material-ui/icons';
import SettingsModal from "../SettingsModal";
import i18n from "../../services/i18n";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import Chip from "@material-ui/core/Chip";
import {Loading} from "../Loading";
import APIManager from "../../services/sdk";
import UserRepo from "../../repository/user";

import './style.scss';
import {ThreeDot} from "../SVG/3dot";

interface IState {
    list: string[];
    loading: boolean;
    open: boolean;
}

class GroupSeenBy extends React.Component<any, IState> {
    private apiManager: APIManager;
    private userRepo: UserRepo;

    constructor(props: any) {
        super(props);

        this.state = {
            list: [],
            loading: false,
            open: false,
        };

        this.apiManager = APIManager.getInstance();
        this.userRepo = UserRepo.getInstance();
    }

    public openDialog(groupId: string, messageId: number) {
        this.setState({
            loading: true,
            open: true,
        });
        this.apiManager.groupSeenBy(groupId).then((res) => {
            this.userRepo.importBulk(false, res.usersList);
            this.setState({
                list: res.statsList.filter(o => (o.messageid || 0) >= messageId).map(o => o.userid || '0'),
                loading: false,
            });
            setTimeout(() => {
                this.forceUpdate();
            }, 2000);
        }).catch(() => {
            this.setState({
                loading: false,
            });
        });
    }

    public render() {
        const {open, loading, list} = this.state;
        return (
            <SettingsModal open={open} title={i18n.t('chat.seen_by')}
                           icon={<VisibilityRounded/>} onClose={this.modalCloseHandler} height={this.getHeight()}
                           autoHeight={true} minHeight={49} maxHeight={380}
            >
                <div className="seen-by-list-dialog">
                    {loading ? <Loading/> : list.length > 0 ? list.map((id) => {
                        return (<Chip key={id} avatar={<UserAvatar id={id}/>}
                                      tabIndex={-1} className="user-chip"
                                      label={<UserName id={id} you={true} unsafe={true}/>}/>);
                    }) : <div className="seen-by-placeholder">
                        <ThreeDot/>
                    </div>}
                </div>
            </SettingsModal>
        );
    }

    private modalCloseHandler = () => {
        this.setState({
            list: [],
            loading: false,
            open: false,
        });
    }

    private getHeight() {
        const {list} = this.state;
        let h = Math.ceil(list.length / 3) * 49;
        if (h > 225) {
            h = 225;
        }
        if (h < 49) {
            h = 49;
        }
        return `${h}px`;
    }
}

export default GroupSeenBy;