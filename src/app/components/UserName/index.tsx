import * as React from 'react';
import {IUser} from '../../repository/user/interface';
import UserRepo from '../../repository/user';

interface IProps {
    className?: string;
    id: string;
    you?: boolean;
}

interface IState {
    className: string;
    id: string;
    user: IUser;
    you: boolean;
}

class UserName extends React.Component<IProps, IState> {
    private userRepo: UserRepo;
    private tryTimeout: any = null;
    private tryCount: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            id: props.id,
            user: {},
            you: props.you || false,
        };

        this.userRepo = UserRepo.getInstance();
    }

    public componentDidMount() {
        this.getUser();
        window.addEventListener('User_DB_Updated', this.getUser);
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.id !== newProps.id) {
            this.tryTimeout = 0;
            clearTimeout(this.tryTimeout);
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
            <span className={className}>{(user && user.id) ? `${user.firstname} ${user.lastname}` : ''}</span>
        );
    }

    private getUser(data?: any) {
        if (!this.state || this.state.id === '') {
            return;
        }
        if (data && data.details.ids.indexOf(this.state.id) === -1) {
            return;
        }
        if (this.state.you && this.userRepo.getCurrentUserId() === this.state.id) {
            this.setState({
                user: {
                    firstname: 'You',
                    id: this.userRepo.getCurrentUserId(),
                    lastname: '',
                },
            });
            return;
        }
        this.userRepo.get(this.state.id).then((user) => {
            this.setState({
                user,
            });
        }).catch(() => {
            if (this.tryCount < 10) {
                this.tryCount++;
                this.tryTimeout = setTimeout(() => {
                    this.getUser();
                }, 1000);
            }
        });
    }
}

export default UserName;