/*
    Creation Time: 2019 - Dec - 15
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {trimStart} from 'lodash';
import {
    KeyboardBackspaceRounded,
    CheckRounded,
    ControlPointRounded,
    LabelRounded,
    EditRounded,
    ColorLensRounded,
} from '@material-ui/icons';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton/IconButton';
import i18n from '../../services/i18n';
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";
import {localize} from "../../services/utilities/localize";
import Scrollbars from "react-custom-scrollbars";
import {throttle} from "lodash";
import {labelColors} from "./vars";
import SDK from "../../services/sdk";
import {ILabel} from "../../repository/label/interface";
import LabelRepo from "../../repository/label";

import './style.scss';
import Broadcaster from "../../services/broadcaster";

interface IProps {
    onClose?: () => void;
}

interface IState {
    color: string;
    list: ILabel[];
    loading: boolean;
    name: string;
    page: string;
    search: string;
    selectedId: number;
}

class LabelMenu extends React.Component<IProps, IState> {
    private sdk: SDK;
    private labelRepo: LabelRepo;
    private broadcaster: Broadcaster;
    private readonly searchThrottle: any;
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);

        this.state = {
            color: '',
            list: [],
            loading: false,
            name: '',
            page: '1',
            search: '',
            selectedId: 0,
        };

        this.sdk = SDK.getInstance();
        this.labelRepo = LabelRepo.getInstance();
        this.broadcaster = Broadcaster.getInstance();
        this.searchThrottle = throttle(this.searchIt, 512);
    }

    public componentDidMount() {
        this.searchLabels();
        this.eventReferences.push(this.broadcaster.listen('Label_DB_Updated', this.searchIt));
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {page, color, name, search, list, loading} = this.state;
        return (
            <div className="label-menu">
                <div className={'page-container page-' + page}>
                    <div className="page page-1">
                        <div className="menu-header">
                            <IconButton
                                onClick={this.props.onClose}
                            >
                                <KeyboardBackspaceRounded/>
                            </IconButton>
                            <label>{i18n.t('label.labels')}</label>
                            <IconButton
                                onClick={this.addLabelPageHandler}
                            >
                                <ControlPointRounded/>
                            </IconButton>
                        </div>
                        <div className="label-search">
                            <FormControl fullWidth={true} className="title-edit">
                                <InputLabel htmlFor="label-search">{i18n.t('dialog.search')}</InputLabel>
                                <Input
                                    id="label-search"
                                    type="text"
                                    inputProps={{
                                        maxLength: 32,
                                    }}
                                    value={search}
                                    onChange={this.searchChangeHandler}
                                />
                            </FormControl>
                        </div>
                        {Boolean(list.length > 0) && <div className="label-container">
                            <Scrollbars
                                autoHide={true}
                                hideTracksWhenNotNeeded={true}
                                universal={true}
                            >
                                {list.map((label, key) => {
                                    return (<div key={key} className="label-item">
                                        <div className="label-icon">
                                            <LabelRounded style={{color: label.colour}}/>
                                        </div>
                                        <div className="label-info">
                                            <div className="label-name">{label.name}</div>
                                            <div className="label-counter">
                                                {i18n.tf('label.label_count', String(localize(1)))}</div>
                                        </div>
                                        <div className="label-action">
                                            <IconButton onClick={this.editLabelHandler(label.id || 0)}>
                                                <EditRounded/>
                                            </IconButton>
                                        </div>
                                    </div>);
                                })}
                            </Scrollbars>
                        </div>}
                        {Boolean(list.length === 0 && !loading) && <div className="label-container label-placeholder">
                            <LabelRounded/>
                            {search.length === 0 ? i18n.t('label.label_placeholder') : i18n.t('label.no_result')}
                        </div>}
                    </div>
                    <div className="page page-2">
                        <div className="menu-header">
                            <IconButton
                                onClick={this.prevPageHandler}
                            >
                                <KeyboardBackspaceRounded/>
                            </IconButton>
                            <label>{i18n.t('label.create_a_new_label')}</label>
                        </div>
                        <div className="input-container">
                            <div className="label-icon-holder" style={{backgroundColor: color}}>
                                <ColorLensRounded/>
                            </div>
                            <TextField
                                className="label-title-input"
                                label={i18n.t('label.label_title')}
                                fullWidth={true}
                                value={name}
                                inputProps={{
                                    maxLength: 32,
                                }}
                                onChange={this.titleChangeHandler}
                            />
                        </div>
                        <div className="label-color-container">
                            {labelColors.map((c, key) => {
                                if (color === c) {
                                    return (
                                        <div key={key} className="label-color-item" style={{backgroundColor: c}}>
                                            <CheckRounded/>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div key={key} className="label-color-item" style={{backgroundColor: c}}
                                             onClick={this.changeLabelColorHandler(c)}/>
                                    );
                                }
                            })}
                        </div>
                        {Boolean(name.length > 0 && color.length > 0) && <div className="actions-bar no-bg">
                            <div className="add-action" onClick={this.createLabelHandler}>
                                <CheckRounded/>
                            </div>
                        </div>}
                        <div className="actions-bar no-bg cancel" onClick={this.cancelHandler}>
                            {i18n.t('general.cancel')}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private prevPageHandler = () => {
        this.setState({
            page: '1',
        });
    }

    private titleChangeHandler = (e: any) => {
        this.setState({
            name: trimStart(e.currentTarget.value),
        });
    }

    private addLabelPageHandler = () => {
        this.setState({
            page: '2',
        });
    }

    private searchChangeHandler = (e: any) => {
        this.setState({
            search: e.currentTarget.value,
        });
        this.searchThrottle();
    }

    private changeLabelColorHandler = (c: string) => (e?: any) => {
        this.setState({
            color: c,
        });
    }

    private cancelHandler = () => {
        this.setState({
            color: '',
            name: '',
            page: '1',
        });
    }

    private createLabelHandler = () => {
        const {selectedId} = this.state;
        if (selectedId === 0) {
            this.sdk.labelCreate(this.state.name, this.state.color).then(() => {
                const {list} = this.state;
                list.push({
                    colour: this.state.color,
                    id: Date.now(),
                    name: this.state.name,
                });
                this.setState({
                    color: '',
                    list,
                    name: '',
                    page: '1',
                });
            }).catch(() => {
                this.cancelHandler();
            });
        } else {
            this.sdk.labelEdit(selectedId, this.state.name, this.state.color).then(() => {
                const {list} = this.state;
                const index = list.findIndex(o => o.id === selectedId);
                if (index > -1) {
                    list[index].colour = this.state.color;
                    list[index].name = this.state.name;
                    this.setState({
                        color: '',
                        list,
                        name: '',
                        page: '1',
                    });
                } else {
                    this.cancelHandler();
                }
            }).catch(() => {
                this.cancelHandler();
            });
        }
    }

    private editLabelHandler = (id: number) => (e?: any) => {
        if (id === 0) {
            return;
        }
        const label = this.state.list.find(o => o.id === id);
        if (label) {
            this.setState({
                color: label.colour || '',
                name: label.name || '',
                page: '2',
                selectedId: id,
            });
        }
    }

    private searchLabels(keyword?: string) {
        if (this.state.loading) {
            return;
        }
        this.setState({
            loading: true,
        });
        this.labelRepo.getManyLabel({keyword}).then((res) => {
            this.setState({
                list: res,
            });
        }).finally(() => {
            this.setState({
                loading: false,
            });
        });
    }

    private searchIt = () => {
        this.searchLabels(this.state.search);
    }
}

export default LabelMenu;
