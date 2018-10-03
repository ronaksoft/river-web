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

class UserAvatar extends React.Component<IProps, IState> {
    private userRepo: UserRepo;

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
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.id !== newProps.id) {
            this.setState({
                id: newProps.id,
            }, () => {
                this.getUser();
            });
        }
    }

    public render() {
        const {user, className} = this.state;
        return (
            <span className={className}><img src={user.avatar}/></span>
        );
    }

    private getUser() {
        this.userRepo.get(this.state.id).then((user) => {
            this.setState({
                user,
            });
        });
    }
}

export default UserAvatar;