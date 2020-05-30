/*
    Creation Time: 2019 - Dec - 15
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {
    KeyboardBackspaceRounded,
    LabelRounded,
    EditRounded,
    DeleteRounded, SearchRounded, AddRounded, AddCircle,
} from '@material-ui/icons';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton/IconButton';
import i18n from '../../services/i18n';
import {localize} from "../../services/utilities/localize";
import Scrollbars from "react-custom-scrollbars";
import {throttle, findIndex} from "lodash";
import APIManager from "../../services/sdk";
import {ILabel} from "../../repository/label/interface";
import LabelRepo from "../../repository/label";
import Broadcaster from "../../services/broadcaster";
import Checkbox from "@material-ui/core/Checkbox";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import AutoSizer from "react-virtualized-auto-sizer";
import DialogSkeleton from "../DialogSkeleton";
import {IMessage} from "../../repository/message/interface";
import CircularProgress from "@material-ui/core/CircularProgress";
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import {InputAdornment} from "@material-ui/core";
import LabelCreate from "../LabelCreate";
import {kMerge} from "../../services/utilities/kDash";
import {LabelMessageItem} from "../LabelItem";

import './style.scss';

interface IProps {
    onClose?: () => void;
    onError?: (text: string) => void;
    onMouseEnter?: (e: any) => void;
    onAction?: (cmd: 'download', message: IMessage) => void;
}

interface IState {
    confirmOpen: boolean;
    label?: ILabel;
    labelList: IMessage[];
    labelLoading: boolean;
    list: ILabel[];
    loadBeforeLoading: boolean;
    loading: boolean;
    page: string;
    search: string;
    selectedId: number;
    selectedIds: number[];
}

const C_LABEL_LIST_LIMIT = 20;

class LabelMenu extends React.Component<IProps, IState> {
    private apiManager: APIManager;
    private labelRepo: LabelRepo;
    private broadcaster: Broadcaster;
    private readonly searchThrottle: any;
    private eventReferences: any[] = [];
    private readonly rtl: boolean = false;
    private labelHasMore: boolean = false;
    private labelCreateRef: LabelCreate | undefined;
    private scrollbarRef: Scrollbars | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            confirmOpen: false,
            labelList: [],
            labelLoading: false,
            list: [],
            loadBeforeLoading: false,
            loading: false,
            page: '1',
            search: '',
            selectedId: 0,
            selectedIds: [],
        };

        this.apiManager = APIManager.getInstance();
        this.labelRepo = LabelRepo.getInstance();
        this.broadcaster = Broadcaster.getInstance();
        this.searchThrottle = throttle(this.searchIt, 512);

        this.rtl = localStorage.getItem('river.lang.dir') === 'rtl';
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
        const {page, confirmOpen, search, list, loading, selectedIds, label} = this.state;
        return (
            <div className="label-menu" onMouseEnter={this.props.onMouseEnter}>
                <LabelCreate ref={this.labelCreateRefHandler} onError={this.props.onError}
                             onDone={this.labelCreateDoneHandler}/>
                <div className={'page-container page-' + page}>
                    <div className="page page-1">
                        <div className="menu-header">
                            <IconButton
                                onClick={this.props.onClose}
                            >
                                <KeyboardBackspaceRounded/>
                            </IconButton>
                            <label>{i18n.t('label.labels')}</label>
                            {Boolean(selectedIds.length > 0) && <IconButton
                                onClick={this.removeLabelHandler}
                                className="add-remove-icon"
                            >
                                <Tooltip title={i18n.t('general.remove')}>
                                    <DeleteRounded/>
                                </Tooltip>
                            </IconButton>}
                        </div>
                        <div className="label-search">
                            <TextField
                                placeholder={i18n.t('dialog.search')}
                                fullWidth={true}
                                InputProps={{
                                    startAdornment:
                                        <InputAdornment position="start" className="dialog-adornment">
                                            <SearchRounded/>
                                        </InputAdornment>
                                }}
                                value={search}
                                variant="outlined"
                                margin="dense"
                                onChange={this.searchChangeHandler}
                            />
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
                                        <div className="label-icon">
                                            <div className="label-circle label-mode"
                                                 style={{backgroundColor: lbl.colour}}>
                                                <LabelRounded className="svg-icon"/>
                                            </div>
                                            <div className="label-circle edit-mode"
                                                 onClick={this.editLabelHandler(lbl)}>
                                                <EditRounded/>
                                            </div>
                                        </div>
                                        <div className="label-info" onClick={this.listLabelHandler(lbl)}>
                                            <div className="label-name">{lbl.name}</div>
                                            <div className="label-counter">
                                                {i18n.tf(lbl.count === 1 ? 'label.label_count' : 'label.label_counts', String(localize(lbl.count || 0)))}</div>
                                        </div>
                                        <div className="label-action">
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
                                    </div>);
                                })}
                                <div key="create-label" className="label-item create-label"
                                     onClick={this.addLabelHandler}>
                                    <div className="label-icon">
                                        <div className="label-circle">
                                            <AddRounded className="svg-icon"/>
                                        </div>
                                    </div>
                                    <div className="label-info">
                                        <div className="label-name">{i18n.t('label.create_label')}</div>
                                    </div>
                                </div>
                            </Scrollbars>
                        </div>}
                        {Boolean(list.length === 0 && !loading) &&
                        <div className="label-container fill-list">
                            <div className="label-placeholder" onClick={this.addLabelHandler}>
                                <AddCircle/>
                                {search.length === 0 ? i18n.t('label.label_placeholder') : i18n.t('label.no_result')}
                            </div>
                        </div>}
                    </div>
                    {Boolean(label) && <div className="page page-2">
                        <div className="menu-header">
                            <IconButton
                                onClick={this.prevPageHandler}
                            >
                                <KeyboardBackspaceRounded/>
                            </IconButton>
                            {label && <>
                                <div className="header-label-icon">
                                    <div className="label-circle" style={{backgroundColor: label.colour}}>
                                        <LabelRounded/>
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
                    classes={{
                        paper: 'kk-context-menu-paper'
                    }}
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

    private labelCreateRefHandler = (ref: any) => {
        this.labelCreateRef = ref;
    }

    private prevPageHandler = () => {
        this.setState({
            page: '1',
        });
    }

    private addLabelHandler = () => {
        if (!this.labelCreateRef) {
            return;
        }
        this.labelCreateRef.openDialog();
    }

    private removeLabelHandler = () => {
        this.setState({
            confirmOpen: true,
        });
    }

    private labelCreateDoneHandler = (label: ILabel) => {
        const {list} = this.state;
        const index = findIndex(list, {id: label.id});
        if (index === -1) {
            list.push(label);
        } else {
            list[index] = kMerge(list[index], label);
        }
        this.setState({
            list,
        });
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

    private editLabelHandler = (label: ILabel) => (e?: any) => {
        if (!this.labelCreateRef || label.id === 0) {
            return;
        }
        this.labelCreateRef.openDialog(label);
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
        this.apiManager.labelDelete(selectedIds).then(() => {
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
        }, () => {
            this.loadLabelList();
        });
    }

    private getLabelWrapper() {
        const {labelList, labelLoading, loadBeforeLoading} = this.state;
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
                                ref={this.scrollbarRefHandler}
                            >
                                {loadBeforeLoading && <div key="label-item-loading" className="label-item-loading">
                                    <CircularProgress size={32} thickness={3} color="inherit"/>
                                </div>}
                                {labelList.map((message, index) => {
                                    return (<LabelMessageItem key={message.id || 0} message={message}
                                                              onAction={this.props.onAction}/>);
                                })}
                                {labelLoading && <div key="label-item-loading" className="label-item-loading">
                                    <CircularProgress size={32} thickness={3} color="inherit"/>
                                </div>}
                            </Scrollbars>
                        </div>
                    )}
                </AutoSizer>
            );
        }
    }

    private scrollbarRefHandler = (ref: any) => {
        this.scrollbarRef = ref;
    }

    /* Custom Scrollbars handler */
    private handleScroll = (e: any) => {
        if (!this.state.labelLoading && this.labelHasMore && this.scrollbarRef) {
            const {scrollTop} = e.target;
            const {labelList} = this.state;
            const pos = (this.scrollbarRef.getScrollHeight() - this.scrollbarRef.getClientHeight() - 64);
            if (pos < scrollTop && labelList.length > 0) {
                this.loadLabelList(labelList[labelList.length - 1].id || 0);
            }
        }
    }

    private transformMessage(res: IMessage[]): IMessage[] {
        return res;
    }

    private loadLabelList(after?: number) {
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
                    labelLoading: false,
                }, () => {
                    if (!loadOnce) {
                        loadOnce = true;
                        this.loadLabelBefore();
                    }
                });
            }, 110);
        }).then((res) => {
            const labelItems = this.transformMessage(res.messageList);
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
        const {label, labelList, loadBeforeLoading} = this.state;
        if (!label || !labelList.length || loadBeforeLoading) {
            return;
        }
        this.setState({
            loadBeforeLoading: true,
        });
        const before = labelList[0].id || 0;
        this.labelRepo.getRemoteMessageByItem(label.id || 0, {min: before + 1, limit: 200}).then((res) => {
            labelList.unshift.apply(labelList, this.transformMessage(res.reverse()));
            this.setState({
                labelList,
                loadBeforeLoading: false,
            });
        }).catch(() => {
            this.setState({
                loadBeforeLoading: false,
            });
        });
    }
}

export default LabelMenu;
