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
import {throttle, difference, intersection, clone} from "lodash";
import Scrollbars from "react-custom-scrollbars";
import {localize} from "../../services/utilities/localize";
import Checkbox from "@material-ui/core/Checkbox";

import './style.scss';

interface IProps {
    onClose?: () => void;
    onDone?: (msgIds: number[], addIds: number[], removeIds: number[]) => void;
}

interface IState {
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
    private msgIds: number[] = [];

    constructor(props: IProps) {
        super(props);

        this.state = {
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
        this.setState({
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
        const {loading, list, open, search, selectedIds} = this.state;
        return (
            <SettingsModal open={open} title={i18n.t('label.label_list')}
                           icon={<CheckRounded/>}
                           onClose={this.modalCloseHandler}
                           onDone={this.doneHandler}
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
                                            {i18n.tf('label.label_count', String(localize(1)))}</div>
                                    </div>
                                    <div className="label-action">
                                        <Checkbox
                                            color="primary"
                                            checked={selectedIds.indexOf(label.id || 0) > -1}
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
                </div>
            </SettingsModal>
        );
    }

    private modalCloseHandler = () => {
        this.setState({
            open: false,
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

    private doneHandler = () => {
        if (!this.props.onDone) {
            return;
        }
        const {selectedIds} = this.state;
        const addIds = difference(selectedIds, this.selectedIds);
        const removeIds = difference(this.selectedIds, selectedIds);
        if (addIds.length === 0 && removeIds.length === 0) {
            return;
        }
        this.props.onDone(this.msgIds, addIds, removeIds);
        this.modalCloseHandler();
    }

    private checkDialogItem = (id: number) => (e: any) => {
        const {selectedIds} = this.state;
        const index = selectedIds.indexOf(id);
        if (index > -1) {
            selectedIds.splice(index, 1);
        } else {
            selectedIds.push(id);
        }
        this.setState({
            selectedIds,
        });
    }
}

export default LabelDialog;
