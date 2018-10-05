import * as React from 'react';
import {IUser} from '../../repository/user/interface';
import UserRepo from '../../repository/user';

interface IProps {
    className?: string;
    id: number;
}

interface IState {
    className: string;
    id: number;
    user: IUser;
}

class UserName extends React.Component<IProps, IState> {
    private userRepo: UserRepo;
    // @ts-ignore
    private failCount: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            id: props.id,
            user: {}
        };

        this.userRepo = UserRepo.getInstance();
    }

    public componentDidMount() {
        this.getUser();
        window.addEventListener('User_DB_Updated', this.getUser);
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.id !== newProps.id) {
            this.failCount = 0;
            this.setState({
                id: newProps.id,
            }, () => {
                this.getUser();
            });
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('User_DB_Updated', this.getUser);
    }

    public render() {
        const {user, className} = this.state;
        return (
            <span className={className}>{user.id ? `${user.firstname} ${user.lastname}` : ''}</span>
        );
    }

    private getUser(data?: any) {
        if (!this.state || this.state.id === 0) {
            return;
        }
        if (data && data.details.ids.indexOf(this.state.id) === -1) {
            return;
        }
        this.userRepo.get(this.state.id).then((user) => {
            this.setState({
                user,
            });
        }).catch(() => {
            this.failCount++;
        });
    }
}

export default UserName;