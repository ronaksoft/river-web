import * as React from 'react';
import {IGroup} from '../../repository/group/interface';
import GroupRepo from '../../repository/group';

interface IProps {
    className?: string;
    id: string;
}

interface IState {
    className: string;
    group: IGroup;
    id: string;
}

class GroupName extends React.Component<IProps, IState> {
    private groupRepo: GroupRepo;
    private tryTimeout: any = null;
    private tryCount: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            group: {},
            id: props.id,
        };

        this.groupRepo = GroupRepo.getInstance();
    }

    public componentDidMount() {
        this.getGroup();
        window.addEventListener('Group_DB_Updated', this.getGroup);
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
        window.removeEventListener('Group_DB_Updated', this.getGroup);
    }

    public render() {
        const {group, className} = this.state;
        return (
            <span className={className}>{(group && group.id) ? `${group.title}` : ''}</span>
        );
    }

    private getGroup(data?: any) {
        if (!this.state || this.state.id === '') {
            return;
        }
        if (data && data.details.ids.indexOf(this.state.id) === -1) {
            return;
        }

        this.groupRepo.get(this.state.id).then((group) => {
            this.setState({
                group,
            });
        }).catch(() => {
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
