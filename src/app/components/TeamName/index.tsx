/*
    Creation Time: 2020 - 07 - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
import {ITeam} from "../../repository/team/interface";
import TeamRepo from "../../repository/team";

interface IProps {
    className?: string;
    id: string;
    onClick?: (e: any) => void;
    onLoad?: (team: ITeam) => void;
    prefix?: string;
    postfix?: string;
}

interface IState {
    className: string;
    id: string;
    team: ITeam;
}

class TeamName extends React.PureComponent<IProps, IState> {
    private teamRepo: TeamRepo;
    private mounted: boolean = true;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            id: props.id,
            team: {},
        };

        this.teamRepo = TeamRepo.getInstance();
    }

    public componentDidMount() {
        this.getTeam();
    }

    public UNSAFE_componentWillReceiveProps(newProps: IProps) {
        if (this.state.id !== newProps.id) {
            this.setState({
                id: newProps.id,
            }, () => {
                this.getTeam();
            });
        }
    }

    public componentWillUnmount() {
        this.mounted = false;
    }

    public render() {
        const {prefix, postfix} = this.props;
        const {team, className} = this.state;
        if (!team) {
            return (<span className={className} onClick={this.clickHandler}/>);
        }
        return (
            <span className={className} onClick={this.clickHandler}>
                {prefix || ''}{team.name || ''}{postfix || ''}
            </span>
        );
    }

    private getTeam = () => {
        if (!this.state || this.state.id === '') {
            return;
        }

        this.teamRepo.get(this.state.id).then((team) => {
            if (!this.mounted) {
                return;
            }
            if (team) {
                this.setState({
                    team,
                }, () => {
                    if (this.props.onLoad) {
                        this.props.onLoad(this.state.team);
                    }
                });
            } else {
                throw Error('not found');
            }
        }).catch(() => {
            if (!this.mounted) {
                return;
            }
        });
    }

    /* Click on user handler */
    private clickHandler = (e: any) => {
        const {team} = this.state;
        if (!team) {
            return;
        }
        if (this.props.onClick) {
            this.props.onClick(e);
        }
        e.stopPropagation();
        e.preventDefault();
    }
}

export default TeamName;
