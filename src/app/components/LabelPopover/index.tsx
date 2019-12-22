/*
    Creation Time: 2019 - Dec - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import Scrollbars from "react-custom-scrollbars";
import {LabelRounded} from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import {clone, isEqual} from "lodash";
import i18n from "../../services/i18n";
import Popover from "@material-ui/core/Popover";
import {ILabel} from "../../repository/label/interface";
import {PopoverPosition} from "@material-ui/core/Popover/Popover";

import './style.scss';

interface IProps {
    onApply: (ids: number[]) => void;
    labelList: ILabel[];
}

interface IState {
    anchorPos?: PopoverPosition;
    appliedSelectedLabelIds: number[];
    labelList: ILabel[];
    selectedLabelIds: number[];
}

class LabelPopover extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        return {
            labelList: props.labelList,
        };
    }

    constructor(props: IProps) {
        super(props);

        this.state = {
            appliedSelectedLabelIds: [],
            labelList: [],
            selectedLabelIds: [],
        };
    }

    public open(pos: PopoverPosition, selectedIds: number[]) {
        this.setState({
            anchorPos: pos,
            appliedSelectedLabelIds: selectedIds,
        });
    }

    public render() {
        const {labelList, appliedSelectedLabelIds, anchorPos} = this.state;
        const height = this.getLabelListHeight();
        return (
            <Popover
                anchorPosition={anchorPos}
                anchorReference="anchorPosition"
                open={Boolean(anchorPos)}
                onClose={this.labelCloseHandler}
                anchorOrigin={{
                    horizontal: "center",
                    vertical: "bottom",
                }}
                className="search-label-popover"
            >
                <div className="search-label-container">
                    <div className="search-label-list" style={{height}}>
                        <Scrollbars
                            autoHide={true}
                            hideTracksWhenNotNeeded={true}
                            universal={true}
                            style={{height}}
                        >
                            {labelList.map((label) => {
                                return (<div key={label.id}
                                             className={'label-item' + (this.isLabelSelected(label.id || 0) ? ' selected' : '')}
                                             onClick={this.toggleLabelHandler(label.id || 0)}>
                                    <div className="label-icon">
                                        <LabelRounded style={{color: label.colour}}/>
                                    </div>
                                    <div className="label-name">{label.name}</div>
                                </div>);
                            })}
                        </Scrollbars>
                    </div>
                    <div className="search-label">
                        <Button fullWidth={true}
                                variant="outlined" color="secondary" size="small"
                                onClick={this.labelApplyHandler}
                                disabled={isEqual(appliedSelectedLabelIds, this.state.selectedLabelIds)}
                        >{i18n.t('general.apply')}</Button>
                    </div>
                </div>
            </Popover>
        );
    }

    private labelCloseHandler = () => {
        this.setState({
            anchorPos: undefined,
        });
    }

    private getLabelListHeight() {
        let height = this.state.labelList.length * 28;
        if (height > 150) {
            height = 150;
        }
        return `${height}px`;
    }

    private toggleLabelHandler = (id: number) => (e: any) => {
        const {selectedLabelIds} = this.state;
        const index = selectedLabelIds.indexOf(id);
        if (index > -1) {
            selectedLabelIds.splice(index, 1);
        } else {
            selectedLabelIds.push(id);
        }
        this.setState({
            selectedLabelIds,
        }, () => {
            this.forceUpdate();
        });
    }

    private isLabelSelected(id: number) {
        return this.state.selectedLabelIds.indexOf(id) > -1;
    }

    private labelApplyHandler = () => {
        this.setState({
            appliedSelectedLabelIds: clone(this.state.selectedLabelIds),
        }, () => {
            if (this.props.onApply) {
                this.props.onApply(this.state.appliedSelectedLabelIds);
            }
        });
        this.labelCloseHandler();
    }
}

export default LabelPopover;
