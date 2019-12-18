/*
    Creation Time: 2019 - Dec - 16
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import SettingsModal from '../SettingsModal';
import {CheckRounded, LabelOutlined, LabelRounded} from '@material-ui/icons';
import i18n from '../../services/i18n';
import {ILabel} from "../../repository/label/interface";
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";
import LabelRepo from "../../repository/label";
import Broadcaster from "../../services/broadcaster";
import {throttle, difference, intersection, clone, isEqual, union} from "lodash";
import Scrollbars from "react-custom-scrollbars";
import {localize} from "../../services/utilities/localize";
import Checkbox from "@material-ui/core/Checkbox";

import './style.scss';

interface IProps {
    onClose?: () => void;
    onDone?: (msgIds: number[], addIds: number[], removeIds: number[]) => void;
}

interface IState {
    indeterminateIds: number[];
    list: ILabel[];
    loading: boolean;
    open: boolean;
    search: string;
    selectedIds: number[];
}

class LabelDialog extends React.Component<IProps, IState> {
    private labelRepo: LabelRepo;
    private broadcaster: Broadcaster;
    private readonly searchThrottle: any;
    private eventReferences: any[] = [];
    private selectedIds: number[] = [];
    private indeterminateIds: number[] = [];
    private msgIds: number[] = [];

    constructor(props: IProps) {
        super(props);

        this.state = {
            indeterminateIds: [],
            list: [],
            loading: false,
            open: false,
            search: '',
            selectedIds: [],
        };

        this.labelRepo = LabelRepo.getInstance();
        this.broadcaster = Broadcaster.getInstance();
        this.searchThrottle = throttle(this.searchIt, 512);
    }

    public openDialog(msgIds: number[], selectedIds: number[][]) {
        this.msgIds = msgIds;
        this.selectedIds = intersection(...selectedIds);
        this.indeterminateIds = [];
        if (selectedIds.length > 0) {
            this.indeterminateIds = union(...selectedIds);
            this.indeterminateIds = difference(this.indeterminateIds, this.selectedIds);
        }
        this.setState({
            indeterminateIds: clone(this.indeterminateIds),
            open: true,
            selectedIds: clone(this.selectedIds),
        });
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
        const {loading, list, open, search, selectedIds, indeterminateIds} = this.state;
        return (
            <SettingsModal open={open} title={i18n.t('label.label_list')}
                           icon={<LabelOutlined/>}
                           onClose={this.modalCloseHandler}
                           height="400px"
                           noScrollbar={true}
            >
                <div className="label-dialog">
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
                                    <div className="label-icon" style={{backgroundColor: label.colour}}>
                                        <LabelOutlined/>
                                    </div>
                                    <div className="label-info">
                                        <div className="label-name">{label.name}</div>
                                        <div className="label-counter">
                                            {i18n.tf(label.count === 1 ? 'label.label_count' : 'label.label_counts', String(localize(label.count || 0)))}</div>
                                    </div>
                                    <div className="label-action">
                                        <Checkbox
                                            color="primary"
                                            checked={selectedIds.indexOf(label.id || 0) > -1}
                                            indeterminate={selectedIds.indexOf(label.id || 0) === -1 && indeterminateIds.indexOf(label.id || 0) > -1}
                                            onChange={this.checkDialogItem(label.id || 0)}
                                            classes={{
                                                checked: 'checkbox-checked',
                                                root: 'checkbox',
                                            }}
                                        />
                                    </div>
                                </div>);
                            })}
                        </Scrollbars>
                    </div>}
                    {Boolean(list.length === 0 && !loading) && <div className="label-container label-placeholder">
                        <LabelRounded/>
                        {search.length === 0 ? i18n.t('label.label_placeholder') : i18n.t('label.no_result')}
                    </div>}
                    {Boolean(!isEqual(this.selectedIds, selectedIds) || !isEqual(this.indeterminateIds, indeterminateIds)) &&
                    <div className="actions-bar no-bg">
                        <div className="add-action" onClick={this.doneHandler}>
                            <CheckRounded/>
                        </div>
                    </div>}
                </div>
            </SettingsModal>
        );
    }

    private modalCloseHandler = () => {
        this.setState({
            open: false,
            selectedIds: [],
        });
        if (this.props.onClose) {
            this.props.onClose();
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

    private searchIt = () => {
        this.searchLabels(this.state.search);
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

    private doneHandler = () => {
        if (!this.props.onDone) {
            return;
        }
        const {selectedIds, indeterminateIds} = this.state;
        const addIds = difference(selectedIds, this.selectedIds);
        let removeIds = this.indeterminateIds.length > 0 ? difference(this.indeterminateIds, indeterminateIds) : difference(this.selectedIds, selectedIds);
        removeIds = difference(removeIds, addIds);
        if (addIds.length === 0 && removeIds.length === 0) {
            return;
        }
        this.props.onDone(this.msgIds, addIds, removeIds);
        this.modalCloseHandler();
    }

    private checkDialogItem = (id: number) => (e: any) => {
        const {selectedIds, indeterminateIds} = this.state;
        const index = selectedIds.indexOf(id);
        if (index > -1) {
            selectedIds.splice(index, 1);
        } else {
            selectedIds.push(id);
        }
        const indIndex = indeterminateIds.indexOf(id);
        if (indIndex > -1 && index > -1) {
            indeterminateIds.splice(indIndex, 1);
        }
        this.setState({
            indeterminateIds,
            selectedIds,
        });
    }
}

export default LabelDialog;
