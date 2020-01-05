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
    LabelOutlined,
    EditRounded,
    ColorLensRounded,
    DeleteRounded,
} from '@material-ui/icons';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton/IconButton';
import i18n from '../../services/i18n';
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";
import {localize} from "../../services/utilities/localize";
import Scrollbars from "react-custom-scrollbars";
import {throttle, findIndex} from "lodash";
import {labelColors} from "./vars";
import SDK from "../../services/sdk";
import {ILabel} from "../../repository/label/interface";
import LabelRepo from "../../repository/label";
import Broadcaster from "../../services/broadcaster";
import Checkbox from "@material-ui/core/Checkbox";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import {IDialog} from "../../repository/dialog/interface";
import {getMessageTitle} from "../Dialog/utils";
import UserRepo from "../../repository/user";
import DialogMessage from "../DialogMessage";
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList, ListOnItemsRenderedProps} from "react-window";
import getScrollbarWidth from "../../services/utilities/scrollbar_width";
import IsMobile from "../../services/isMobile";
import DialogSkeleton from "../DialogSkeleton";
import {IMessage} from "../../repository/message/interface";
import CircularProgress from "@material-ui/core/CircularProgress";
import Tooltip from '@material-ui/core/Tooltip/Tooltip';

import './style.scss';

interface IProps {
    onClose?: () => void;
}

interface IState {
    color: string;
    confirmOpen: boolean;
    label?: ILabel;
    labelList: IDialog[];
    labelLoading: boolean;
    list: ILabel[];
    loading: boolean;
    name: string;
    page: string;
    page2Mode: 'create' | 'label';
    search: string;
    selectedId: number;
    selectedIds: number[];
}

const listStyle: React.CSSProperties = {
    overflowX: 'visible',
    overflowY: 'visible',
};

const C_LABEL_LIST_LIMIT = 20;

class LabelMenu extends React.Component<IProps, IState> {
    private list: FixedSizeList | undefined;
    private sdk: SDK;
    private labelRepo: LabelRepo;
    private broadcaster: Broadcaster;
    private readonly searchThrottle: any;
    private eventReferences: any[] = [];
    private userId: string = UserRepo.getInstance().getCurrentUserId();
    private readonly rtl: boolean = false;
    private readonly hasScrollbar: boolean = false;
    private readonly isMobile: boolean = false;
    private labelHasMore: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            color: '',
            confirmOpen: false,
            labelList: [],
            labelLoading: false,
            list: [],
            loading: false,
            name: '',
            page: '1',
            page2Mode: 'create',
            search: '',
            selectedId: 0,
            selectedIds: [],
        };

        this.sdk = SDK.getInstance();
        this.labelRepo = LabelRepo.getInstance();
        this.broadcaster = Broadcaster.getInstance();
        this.searchThrottle = throttle(this.searchIt, 512);

        this.hasScrollbar = getScrollbarWidth() > 0;
        this.rtl = localStorage.getItem('river.lang.dir') === 'rtl';
        this.isMobile = this.isMobile = IsMobile.isAny();
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
        const {page, color, confirmOpen, name, search, list, loading, selectedIds, page2Mode, label} = this.state;
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
                                className="add-remove-icon"
                            >
                                <Tooltip
                                    title={i18n.t(selectedIds.length > 0 ? 'general.remove' : 'label.create_a_new_label')}>
                                    {Boolean(selectedIds.length > 0) ? <DeleteRounded/> : <ControlPointRounded/>}
                                </Tooltip>
                            </IconButton>
                        </div>
                        <div className="label-search">
                            <FormControl fullWidth={true} className="title-edit">
                                <InputLabel htmlFor="label-search-2">{i18n.t('dialog.search')}</InputLabel>
                                <Input
                                    id="label-search-2"
                                    type="text"
                                    inputProps={{
                                        maxLength: 32,
                                    }}
                                    value={search}
                                    onChange={this.searchChangeHandler}
                                />
                            </FormControl>
                        </div>
                        {Boolean(list.length > 0) &&
                        <div className={'label-container' + (selectedIds.length > 0 ? ' selectable-mode' : '')}>
                            <Scrollbars
                                autoHide={true}
                                hideTracksWhenNotNeeded={true}
                                universal={true}
                            >
                                {list.map((lbl, key) => {
                                    return (<div key={key} className="label-item">
                                        <div className="label-icon" style={{color: lbl.colour}}>
                                            <div className="label-circle" style={{backgroundColor: lbl.colour}}>
                                                <LabelOutlined className="svg-icon"/>
                                            </div>
                                            <Checkbox
                                                color="primary"
                                                checked={selectedIds.indexOf(lbl.id || 0) > -1}
                                                onChange={this.selectLabelHandler(lbl.id || 0)}
                                                classes={{
                                                    checked: 'checkbox-checked',
                                                    root: 'checkbox',
                                                }}
                                                className="checkbox-icon"
                                            />
                                        </div>
                                        <div className="label-info" onClick={this.listLabelHandler(lbl)}>
                                            <div className="label-name">{lbl.name}</div>
                                            <div className="label-counter">
                                                {i18n.tf(lbl.count === 1 ? 'label.label_count' : 'label.label_counts', String(localize(lbl.count || 0)))}</div>
                                        </div>
                                        <div className="label-action">
                                            <IconButton onClick={this.editLabelHandler(lbl.id || 0)}>
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
                    {Boolean(page2Mode === 'create') && <div className="page page-2">
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
                        {Boolean(name.length > 0 && color.length > 0) &&
                        <div className={'actions-bar no-bg' + (loading ? 'disabled' : '')}>
                            <div className="add-action" onClick={this.createLabelHandler}>
                                <CheckRounded/>
                            </div>
                        </div>}
                        <div className="actions-bar no-bg cancel" onClick={this.cancelHandler}>
                            {i18n.t('general.cancel')}
                        </div>
                    </div>}
                    {Boolean(page2Mode === 'label') && <div className="page page-2">
                        <div className="menu-header">
                            <IconButton
                                onClick={this.prevPageHandler}
                            >
                                <KeyboardBackspaceRounded/>
                            </IconButton>
                            {label && <>
                                <div className="header-label-icon">
                                    <div className="label-circle" style={{backgroundColor: label.colour}}>
                                        <LabelOutlined/>
                                    </div>
                                </div>
                                <div className="header-label-info" onClick={this.listLabelHandler(label)}>
                                    <div className="label-name">{label.name}</div>
                                    <div className="label-counter">
                                        {i18n.tf(label.count === 1 ? 'label.label_count' : 'label.label_counts', String(localize(label.count || 0)))}</div>
                                </div>
                            </>}
                        </div>
                        <div className="label-container">
                            {this.getLabelWrapper()}
                        </div>
                    </div>}
                </div>
                <Dialog
                    open={confirmOpen}
                    onClose={this.confirmCloseHandler}
                    className="kk-context-menu"
                >
                    <DialogTitle>{i18n.t('general.are_you_sure')}</DialogTitle>
                    <DialogActions>
                        <Button onClick={this.confirmCloseHandler} color="secondary">{i18n.t('general.cancel')}</Button>
                        <Button onClick={this.confirmAcceptHandler} color="primary"
                                autoFocus={true}>{i18n.t('general.yes')}</Button>
                    </DialogActions>
                </Dialog>
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
        const {selectedIds} = this.state;
        if (selectedIds.length === 0) {
            this.setState({
                color: '',
                name: '',
                page: '2',
                page2Mode: 'create',
            });
        } else {
            this.setState({
                confirmOpen: true,
            });
        }
    }

    private searchChangeHandler = (e: any) => {
        this.setState({
            search: e.currentTarget.value,
        }, () => {
            if (this.state.search.length === 0) {
                this.searchThrottle.cancel();
                this.searchIt();
            } else {
                this.searchThrottle();
            }
        });
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
        const {selectedId, loading} = this.state;
        if (loading) {
            return;
        }
        this.setState({
            loading: true,
        });
        if (selectedId === 0) {
            this.sdk.labelCreate(this.state.name, this.state.color).then((res) => {
                const {list} = this.state;
                list.push({
                    colour: res.colour || '',
                    count: res.count || 0,
                    id: res.id || 0,
                    name: res.name || '',
                });
                this.setState({
                    color: '',
                    list,
                    loading: false,
                    name: '',
                    page: '1',
                });
            }).catch(() => {
                this.cancelHandler();
                this.setState({
                    loading: false,
                });
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
                        loading: false,
                        name: '',
                        page: '1',
                    });
                } else {
                    this.cancelHandler();
                }
            }).catch(() => {
                this.cancelHandler();
                this.setState({
                    loading: false,
                });
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
                page2Mode: 'create',
                selectedId: id,
            });
        }
    }

    private searchLabels(keyword?: string) {
        if (this.state.loading) {
            return;
        }
        if (keyword && keyword.length === 0) {
            keyword = undefined;
        }
        this.setState({
            loading: true,
        });
        this.labelRepo.search({keyword}).then((res) => {
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

    private selectLabelHandler = (id: number) => (e: any, checked: boolean) => {
        const {selectedIds} = this.state;
        const index = selectedIds.indexOf(id);
        if (index > -1 && !checked) {
            selectedIds.splice(index, 1);
        } else if (index === -1 && checked) {
            selectedIds.push(id);
        }
        this.setState({
            selectedIds,
        });
    }

    private confirmCloseHandler = () => {
        this.setState({
            confirmOpen: false,
        });
    }

    private confirmAcceptHandler = () => {
        const {selectedIds} = this.state;
        this.sdk.labelDelete(selectedIds).then(() => {
            const {list} = this.state;
            selectedIds.forEach((id) => {
                const index = findIndex(list, {id});
                if (index > -1) {
                    list.splice(index, 1);
                }
            });
            this.setState({
                confirmOpen: false,
                list,
                selectedIds: [],
            });
        });
    }

    private listLabelHandler = (label?: ILabel) => (e: any) => {
        if (!label) {
            return;
        }
        this.setState({
            label,
            labelList: [],
            page: '2',
            page2Mode: 'label',
        }, () => {
            this.getLabelList();
        });
    }

    private getLabelWrapper() {
        const {labelList, labelLoading} = this.state;
        if (labelList.length === 0) {
            if (labelLoading) {
                return (<div className="label-list-container">
                    {DialogSkeleton()}
                </div>);
            } else {
                return (
                    <div className="label-list-container no-result">
                        <LabelRounded/>
                        {i18n.t('label.no_result')}
                    </div>
                );
            }
        } else {
            if (this.isMobile || !this.hasScrollbar) {
                return (
                    <AutoSizer>
                        {({width, height}: any) => {
                            return (<FixedSizeList
                                ref={this.refHandler}
                                itemSize={64}
                                itemCount={labelLoading ? labelList.length + 1 : labelList.length}
                                overscanCount={10}
                                width={width}
                                height={height}
                                className="label-list-container"
                                direction={this.rtl ? 'ltr' : 'rtl'}
                                onItemsRendered={this.labelItemRendered}
                            >
                                {({index, style}) => {
                                    return this.rowRender({index, style, key: index});
                                }}
                            </FixedSizeList>);
                        }}
                    </AutoSizer>
                );
            } else {
                return (
                    <AutoSizer>
                        {({width, height}: any) => (
                            <div className="label-list-inner" style={{
                                height: height + 'px',
                                width: width + 'px',
                            }}>
                                <Scrollbars
                                    autoHide={true}
                                    style={{
                                        height: height + 'px',
                                        width: width + 'px',
                                    }}
                                    onScroll={this.handleScroll}
                                    hideTracksWhenNotNeeded={true}
                                    universal={true}
                                    rtl={!this.rtl}
                                >
                                    <FixedSizeList
                                        ref={this.refHandler}
                                        itemSize={64}
                                        itemCount={labelLoading ? labelList.length + 1 : labelList.length}
                                        overscanCount={10}
                                        width={width}
                                        height={height}
                                        className="label-list-container"
                                        style={listStyle}
                                        onItemsRendered={this.labelItemRendered}
                                    >
                                        {({index, style}) => {
                                            return this.rowRender({index, style, key: index});
                                        }}
                                    </FixedSizeList>
                                </Scrollbars>
                            </div>
                        )}
                    </AutoSizer>
                );
            }
        }
    }

    /* Custom Scrollbars handler */
    private handleScroll = (e: any) => {
        const {scrollTop} = e.target;
        if (this.list) {
            this.list.scrollTo(scrollTop);
        }
    }

    private refHandler = (ref: any) => {
        this.list = ref;
    }

    private rowRender = ({index, key, style}: any): any => {
        const dialog = this.state.labelList[index];
        if (dialog) {
            return (
                <div style={style} key={dialog.topmessageid || dialog.peerid || index}>
                    <DialogMessage dialog={dialog} isTyping={{}} selectedId=""
                                   messageId={dialog.topmessageid}/>
                </div>
            );
        } else {
            return (<div style={style} key="label-item-loading" className="label-item-loading">
                <CircularProgress size={32} thickness={3} color="inherit"/>
            </div>);
        }
    }

    private transformMessage(res: IMessage[]): IDialog[] {
        return res.map((msg) => {
            const messageTitle = getMessageTitle(msg);
            return {
                label_ids: msg.labelidsList,
                last_update: msg.createdon,
                only_contact: true,
                peerid: msg.peerid,
                peertype: msg.peertype,
                preview: messageTitle.text,
                preview_icon: messageTitle.icon,
                preview_me: msg.me,
                preview_rtl: msg.rtl,
                saved_messages: msg.peerid === this.userId,
                sender_id: msg.senderid,
                topmessageid: msg.id,
            };
        });
    }

    private getLabelList(after?: number) {
        const {label, labelLoading} = this.state;
        if (!label || labelLoading) {
            return;
        }
        this.setState({
            labelLoading: true,
        });

        let loadOnce = false;
        this.labelRepo.getMessageByItem(label.id || 0, {max: after || 0, limit: C_LABEL_LIST_LIMIT}, (cacheMsg) => {
            if (after) {
                return;
            }
            setTimeout(() => {
                this.setState({
                    labelList: this.transformMessage(cacheMsg),
                }, () => {
                    if (!loadOnce) {
                        loadOnce = true;
                        this.loadLabelBefore();
                    }
                });
            }, 110);
        }).then((res) => {
            const labelItems: IDialog[] = this.transformMessage(res.messageList);
            this.labelHasMore = res.labelCount === C_LABEL_LIST_LIMIT;
            if (!after) {
                setTimeout(() => {
                    this.setState({
                        labelList: labelItems,
                        labelLoading: false,
                    }, () => {
                        if (!loadOnce) {
                            loadOnce = true;
                            this.loadLabelBefore();
                        }
                    });
                }, after ? 0 : 110);
            } else {
                const {labelList} = this.state;
                labelList.push.apply(labelList, labelItems);
                this.setState({
                    labelList,
                    labelLoading: false,
                });
            }
        });
    }

    private loadLabelBefore() {
        const {label, labelList} = this.state;
        if (!label || !labelList.length) {
            return;
        }
        const before = labelList[0].topmessageid || 0;
        this.labelRepo.getRemoteMessageByItem(label.id || 0, {min: before + 1, limit: 200}).then((res) => {
            labelList.unshift.apply(labelList, this.transformMessage(res.reverse()));
            this.setState({
                labelList,
            });
        });
    }

    private labelItemRendered = (props: ListOnItemsRenderedProps) => {
        if (!this.labelHasMore || this.state.labelLoading) {
            return;
        }
        const {labelList} = this.state;
        if ((labelList.length - 5) < props.visibleStopIndex) {
            this.getLabelList(labelList[labelList.length - 1].topmessageid);
        }
    }
}

export default LabelMenu;
