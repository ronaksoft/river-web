/*
    Creation Time: 2020 - Oct - 31
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
import {localize} from "../../services/utilities/localize";
import Badge from "@material-ui/core/Badge";
import {TextAvatar} from "../UserAvatar";
import {ITeam} from "../../repository/team/interface";
import {findIndex} from "lodash";
import {PersonRounded, CallRounded} from "@material-ui/icons";
import Scrollbars from "react-custom-scrollbars";
import i18n from "../../services/i18n";

import './style.scss';
import {C_LOCALSTORAGE} from "../../services/sdk/const";

interface IProps {
    onAction: (cmd: string) => (e: any) => void;
    onTeamChange: (team: ITeam) => void;
    selectedTeamId: string;
}

interface IState {
    panelFocus: boolean;
    teamList: ITeam[];
    selectedTeamId: string;
}

class LeftPanel extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        if (state.selectedTeamId === props.selectedTeamId) {
            return null;
        }
        return {
            selectedTeamId: props.selectedTeamId,
        };
    }

    private rtl: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            panelFocus: false,
            selectedTeamId: props.selectedTeamId,
            teamList: [],
        };

        this.rtl = localStorage.getItem(C_LOCALSTORAGE.LangDir) === 'rtl';
    }

    public setTeamList(list: ITeam[]) {
        this.setState({
            teamList: list,
        });
    }

    public setUpdateFlag(enable: boolean, teamId: string) {
        const {teamList} = this.state;
        const index = findIndex(teamList, {id: teamId});
        if (index > -1) {
            if (Boolean(teamList[index].unread_counter) !== enable) {
                teamList[index].unread_counter = enable ? 1 : 0;
                this.setState({
                    teamList,
                });
            }
        }
    }

    public setUnreadCounter(counter: number, teamId: string) {
        const {teamList} = this.state;
        const index = findIndex(teamList, {id: teamId});
        if (index > -1) {
            teamList[index].unread_counter = counter;
            this.setState({
                teamList,
            });
        }
    }

    public render() {
        const {teamList, panelFocus, selectedTeamId} = this.state;
        return (
            <div className={'left-panel' + (panelFocus ? ' panel-focus' : '')}
                 onMouseEnter={this.panelMouseEnterHandler}
                 onMouseLeave={this.panelMouseLeaveHandler}>
                <div className="folder-container">
                    <Scrollbars
                        universal={true}
                        rtl={this.rtl}
                        style={{
                            height: '100%',
                            width: '100%',
                        }}
                    >
                        <div className="folder-gap"/>
                        {teamList.map((team) => {
                            return (<Badge key={team.id} color="primary"
                                           badgeContent={localize(team.unread_counter || 0)}
                                           invisible={!Boolean(team.unread_counter)}
                                           variant={selectedTeamId === team.id && panelFocus ? 'standard' : 'dot'}>
                                <div className={'folder-item' + (selectedTeamId === team.id ? ' selected' : '')}
                                     onClick={this.selectTeamHandler(team)}>
                                    <TextAvatar fname={team.name}
                                                icon={team.id === '0' ? <PersonRounded/> : undefined}/>
                                    <div className="folder-name">
                                        <div className="inner">{team.name}</div>
                                    </div>
                                </div>
                            </Badge>);
                        })}
                    </Scrollbars>
                </div>
                <div className="folder-container bottom">
                    <div className="folder-item" onClick={this.props.onAction('call_history')}>
                        <TextAvatar fname={'f'} icon={<CallRounded/>}/>
                        <div className="folder-name">
                            <div className="inner">{i18n.t('chat.call_history')}</div>
                        </div>
                    </div>
                </div>
            </div>);
    }

    private panelMouseEnterHandler = () => {
        this.setState({
            panelFocus: true,
        });
    }

    private panelMouseLeaveHandler = () => {
        this.setState({
            panelFocus: false,
        });
    }

    private selectTeamHandler = (team: ITeam) => () => {
        this.setState({
            selectedTeamId: team.id || '0',
        });
        this.props.onTeamChange(team);
    }
}

export default LeftPanel;
