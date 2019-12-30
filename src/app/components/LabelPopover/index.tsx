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
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import {ILabel} from "../../repository/label/interface";
import {PopoverPosition} from "@material-ui/core/Popover/Popover";

import './style.scss';

interface IProps {
    onApply: (ids: number[]) => void;
    onCancel?: () => void;
    labelList: ILabel[];
    closeAfterSelect?: boolean;
}

interface IState {
    labelList: ILabel[];
    open: boolean;
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
            labelList: [],
            open: false,
            selectedLabelIds: [],
        };
    }

    public open(pos: PopoverPosition, selectedIds: number[]) {
        this.setState({
            open: true,
            selectedLabelIds: selectedIds,
        });
    }

    public render() {
        const {labelList, open} = this.state;
        const height = this.getLabelListHeight();
        return (
            <div className="search-label-popover">
                {open && <ClickAwayListener
                    onClickAway={this.labelCloseHandler}
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
                                    if (!this.isLabelSelected(label.id || 0)) {
                                        return (<div key={label.id}
                                                     className="label-item"
                                                     onClick={this.toggleLabelHandler(label.id || 0)}>
                                            <div className="label-icon">
                                                <LabelRounded style={{color: label.colour}}/>
                                            </div>
                                            <div className="label-name">{label.name}</div>
                                        </div>);
                                    } else {
                                        return '';
                                    }
                                })}
                            </Scrollbars>
                        </div>
                    </div>
                </ClickAwayListener>}
            </div>
        );
    }

    private labelCloseHandler = () => {
        this.setState({
            open: false,
        });
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    private getLabelListHeight() {
        let height = (this.state.labelList.length - this.state.selectedLabelIds.length) * 28;
        if (height > 100) {
            height = 100;
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
            this.labelApplyHandler();
        });
    }

    private isLabelSelected(id: number) {
        return this.state.selectedLabelIds.indexOf(id) > -1;
    }

    private labelApplyHandler = () => {
        if (this.props.onApply) {
            this.props.onApply(this.state.selectedLabelIds);
        }
        if (this.props.closeAfterSelect) {
            this.labelCloseHandler();
        }
    }
}

export default LabelPopover;
