import * as React from 'react';
import {IUser} from '../../repository/user/interface';
import UserRepo from '../../repository/user';

import './style.css';

interface IProps {
    className?: string;
    id: string;
}

interface IState {
    className: string;
    id: string;
    user: IUser;
}

const defaultColors = [
    'linear-gradient(45deg,#30496B,#30B8D2)',
    'linear-gradient(45deg,#B6C1D4,#EC68B1)',
    'linear-gradient(45deg,#476892,#59355D)',
    'linear-gradient(45deg,#3D3949,#6772A4)',
    'linear-gradient(45deg,#FBCA88,#EF69AD)',
    'linear-gradient(45deg,#ABE5E6,#7062F0)',
    'linear-gradient(45deg,#F32F8E,#B236D0)',
    'linear-gradient(45deg,#DA1FF2,#4C15D0)',
    'linear-gradient(45deg,#7D6AE7,#56A2D5)',
    'linear-gradient(45deg,#239FE9,#44D5F3)',
    'linear-gradient(45deg,#FD5A49,#FDDC98)',
];

const sumChars = (str: string): number => {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
        sum += str.charCodeAt(i);
    }

    return sum;
};

const hexToRgb = (hex: string): any => {
    if (hex.charAt && hex.charAt(0) === '#') {
        hex = removeHash(hex);
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return {r, g, b};
};

const removeHash = (hex: string) => {
    const arr = hex.split('');
    arr.shift();
    return arr.join('');
};

const contrast = (hex: string) => {
    const rgb = hexToRgb(hex);
    const o = Math.round(((parseInt(rgb.r, 10) * 299) + (parseInt(rgb.g, 10) * 587) + (parseInt(rgb.b, 10) * 114)) / 1000);
    return (o <= 180) ? '#fff' : '#333';
};

const TextAvatar = (fname?: string, lname?: string) => {
    const str = fname || '' + lname || '';
    let name = 'NA';
    if (fname && lname) {
        name = fname.substr(0, 1) + ' ' + lname.substr(0, 1);
    } else if (fname && !lname) {
        name = fname.substr(0, 2);
    } else if (!fname && lname) {
        name = lname.substr(0, 2);
    }
    name = name.toLocaleUpperCase();
    const i = sumChars(str) % defaultColors.length;
    const background = defaultColors[i];
    const color = contrast(background.split(',')[2].substr(0, 6));
    const style = {
        background,
        color,
    };
    return (<span className="text-avatar" style={style}><span className="inner">{name}</span></span>);
};

class UserAvatar extends React.Component<IProps, IState> {
    private userRepo: UserRepo;
    private tryTimeout: any = null;
    private tryCount: number = 0;

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
            <span className={className}>{(user && user.avatar) ?
                <img src={user.avatar}/> : TextAvatar(user.firstname, user.lastname)}</span>
        );
    }

    private getUser(data?: any) {
        if (!this.state || this.state.id === '') {
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
            if (this.tryCount < 10) {
                this.tryCount++;
                this.tryTimeout = setTimeout(() => {
                    this.getUser();
                }, 1000);
            }
        });
    }
}

export default UserAvatar;
export {TextAvatar};