/*
    Creation Time: 2018 - Nov - 26
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {IGroup} from '../../repository/group/interface';
import GroupRepo from '../../repository/group';
import {GroupRounded} from '@material-ui/icons';
import Broadcaster from '../../services/broadcaster';

interface IProps {
    className?: string;
    defaultString?: string;
    id: string;
    noIcon?: boolean;
    prefix?: string;
}

interface IState {
    className: string;
    group: IGroup | null;
    id: string;
    prefix: string;
}

class GroupName extends React.Component<IProps, IState> {
    private groupRepo: GroupRepo;
    private tryTimeout: any = null;
    private tryCount: number = 0;
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];
    private mounted: boolean = true;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            group: null,
            id: props.id,
            prefix: props.prefix || '',
        };

        this.groupRepo = GroupRepo.getInstance();
        this.broadcaster = Broadcaster.getInstance();
    }

    public componentDidMount() {
        this.getGroup();
        this.eventReferences.push(this.broadcaster.listen('Group_DB_Updated', this.getGroup));
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.id !== newProps.id) {
            this.tryTimeout = 0;
            clearTimeout(this.tryTimeout);
            this.setState({
                id: newProps.id,
            }, () => {
                this.getGroup();
            });
        }
    }

    public componentWillUnmount() {
        this.mounted = false;
        clearTimeout(this.tryTimeout);
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {group, className, prefix} = this.state;
        const {defaultString, noIcon} = this.props;
        return (
            <span
                className={className}>{Boolean(noIcon !== true) && <GroupRounded/>}{(group && group.id) ? `${prefix}${group.title}` : (defaultString || '')}</span>
        );
    }

    private getGroup = (data?: any) => {
        if (!this.state || this.state.id === '') {
            return;
        }
        if (data && data.ids.indexOf(this.state.id) === -1) {
            return;
        }

        this.groupRepo.get(this.state.id).then((group) => {
            if (!this.mounted) {
                return;
            }
            this.setState({
                group,
            });
        }).catch(() => {
            if (!this.mounted) {
                return;
            }
            if (this.tryCount < 10) {
                this.tryCount++;
                this.tryTimeout = setTimeout(() => {
                    this.getGroup();
                }, 1000);
            }
        });
    }
}

export default GroupName;
