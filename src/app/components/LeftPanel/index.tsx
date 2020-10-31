/*
    Creation Time: 2020 - Oct - 31
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {localize} from "../../services/utilities/localize";
import Badge from "@material-ui/core/Badge";
import {TextAvatar} from "../UserAvatar";
import {ITeam} from "../../repository/team/interface";

import './style.scss';

interface IProps {
    onTeamChange: (team: ITeam) => void;
    selectedTeamId: string;
}

interface IState {
    panelFocus: boolean;
    teamList: ITeam[];
    selectedTeamId: string;
}

class LeftPanel extends React.PureComponent<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        if (state.selectedTeamId === props.selectedTeamId) {
            return null;
        }
        return {
            selectedTeamId: props.selectedTeamId,
        };
    }

    constructor(props: IProps) {
        super(props);

        this.state = {
            panelFocus: false,
            selectedTeamId: props.selectedTeamId,
            teamList: [],
        };
    }

    public componentDidMount() {
        //
    }

    public componentWillUnmount() {
        //
    }

    public setTeamList(list: ITeam[]) {
        this.setState({
            teamList: list,
        });
    }

    public render() {
        const {teamList, panelFocus, selectedTeamId} = this.state;
        return (
            <div className={'left-panel' + (panelFocus ? ' panel-focus' : '')}
                 onMouseEnter={this.panelMouseEnterHandler}
                 onMouseLeave={this.panelMouseLeaveHandler}>
                <div className="folder-container">
                    {teamList.map((team) => {
                        return (<Badge key={team.id} color="primary" badgeContent={localize(team.unread_counter || 0)}
                                       invisible={!team.unread_counter}>
                            <div className={'folder-item' + (selectedTeamId === team.id ? ' selected' : '')}
                                 onClick={this.selectTeamHandler(team)}>
                                <TextAvatar fname={team.name}/>
                                <div className="folder-name">
                                    <div className="inner">{team.name}</div>
                                </div>
                            </div>
                        </Badge>);
                    })}
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
