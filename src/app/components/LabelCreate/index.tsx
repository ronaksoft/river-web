/*
    Creation Time: 2020 - May - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import SettingsModal from '../SettingsModal';
import {LabelRounded, LabelOutlined} from '@material-ui/icons';
import i18n from '../../services/i18n';
import {ILabel} from "../../repository/label/interface";
import LabelRepo from "../../repository/label";
import APIManager from "../../services/sdk";
import {TextField, Button} from "@material-ui/core";
import {labelColors} from "./vars";
import {cloneDeep, trimStart} from 'lodash';
import {C_ERR, C_ERR_ITEM} from "../../services/sdk/const";

import './style.scss';

interface IProps {
    onClose?: () => void;
    onDone?: (label: ILabel) => void;
    onError?: (message: string) => void;
}

interface IState {
    label: ILabel;
    loading: boolean;
    open: boolean;
}

const emptyLabel: ILabel = {
    colour: '',
    count: 0,
    id: 0,
    name: '',
};

class LabelCreate extends React.Component<IProps, IState> {
    private labelRepo: LabelRepo;
    private apiManager: APIManager;

    constructor(props: IProps) {
        super(props);

        this.state = {
            label: cloneDeep(emptyLabel),
            loading: false,
            open: false,
        };

        this.labelRepo = LabelRepo.getInstance();
        this.apiManager = APIManager.getInstance();
    }

    public openDialog(label?: ILabel) {
        this.setState({
            label: label || cloneDeep(emptyLabel),
            open: true,
        });
    }

    public render() {
        const {open, label, loading} = this.state;
        return (
            <SettingsModal open={open} title={i18n.t('label.create_label')}
                           icon={<LabelOutlined/>}
                           onClose={this.modalCloseHandler}
                           height="370px"
                           noScrollbar={true}
            >
                <div className="create-label-dialog">
                    <div className="input-container">
                        <div className="label-icon-holder" style={{backgroundColor: label.colour}}>
                            <LabelRounded/>
                        </div>
                        <TextField
                            className="label-title-input"
                            label={i18n.t('label.label_title')}
                            fullWidth={true}
                            value={label.name}
                            inputProps={{
                                maxLength: 32,
                            }}
                            onChange={this.titleChangeHandler}
                        />
                    </div>
                    <div className="label-color-container">
                        {labelColors.map((c, key) => {
                            return (
                                <div key={key}
                                     className={'label-color-item' + (label.colour === c ? ' selected' : '')}
                                     style={{backgroundColor: c}}
                                     onClick={this.colorChangeHandler(c)}/>
                            );
                        })}
                    </div>
                    <div className="label-footer">
                        <Button>{i18n.t('general.cancel')}</Button>
                        <Button color="primary"
                                disabled={Boolean((label.name || '').length === 0 || (label.colour || '').length === 0) || loading}
                                onClick={this.createLabelHandler}
                        >{i18n.t(label.id === 0 ? 'general.create' : 'general.apply')}</Button>
                    </div>
                </div>
            </SettingsModal>
        );
    }

    private modalCloseHandler = () => {
        this.setState({
            label: cloneDeep(emptyLabel),
            open: false,
        });
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    private titleChangeHandler = (e: any) => {
        const {label} = this.state;
        label.name = trimStart(e.currentTarget.value);
        this.setState({
            label,
        });
    }

    private colorChangeHandler = (c: string) => (e?: any) => {
        const {label} = this.state;
        label.colour = c;
        this.setState({
            label,
        });
    }

    private createLabelHandler = () => {
        const {loading, label} = this.state;
        if (loading) {
            return;
        }
        this.setState({
            loading: true,
        });
        if (label.id === 0) {
            this.apiManager.labelCreate(label.name || '', label.colour || '').then((res) => {
                this.labelRepo.upsert([res]);
                this.modalCloseHandler();
                if (this.props.onDone) {
                    this.props.onDone(res);
                }
            }).catch((err) => {
                if (this.props.onError && err.code === C_ERR.ErrCodeTooMany && err.items === C_ERR_ITEM.ErrItemLabel) {
                    this.props.onError(i18n.t('label.max_label_warning'));
                }
                this.modalCloseHandler();
            });
        } else {
            this.apiManager.labelEdit(label.id || 0, label.name || '', label.colour || '').then(() => {
                this.labelRepo.upsert([label]);
                this.modalCloseHandler();
                if (this.props.onDone) {
                    this.props.onDone(label);
                }
            }).catch(() => {
                this.modalCloseHandler();
            });
        }
    }
}

export default LabelCreate;
