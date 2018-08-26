/**
 * @file component/PostBody/index.tsx
 * @auther naamesteh < naemabadei.shayesteh@gmail.com >
 * @desc This file renders the full name of accounts where we need it.
 * in this component we store accounts in redux. Component get requiered data directly from store or api call.
 * Document By : naamesteh
 * Date of documantion : 07/24/2017
 * Review by : robzizo
 * Date of review : 07/24/2017
 */
import * as React from 'react';
import {arrayMove, SortableContainer} from 'react-sortable-hoc';
import VirtualList from './../VirtualList';

interface IProps {
    items: any[];
}

interface IState {
    items: any[];
}

const SortableList = SortableContainer(VirtualList, {withRef: true});

/**
 * @class FullName
 * @classdesc Component renders the FullName html element as an span
 * @extends {React.Component<IProps, IState>}
 */

class Orderable extends React.Component<IProps, IState> {
    private SortableList: any;

    constructor(props: any) {
        super(props);
        this.state = {
            items: this.props.items,
        };
    }

    public render() {
        return (
            <SortableList
                ref={this.refHandler}
                items={this.state.items}
                onSortEnd={this.onSortEnd}
            />
        );
    }

    private refHandler = (value: any) => {
        this.SortableList = value;
    }

    private onSortEnd = ({oldIndex, newIndex}: any) => {
        if (oldIndex !== newIndex) {
            const {items} = this.state;

            this.setState({
                items: arrayMove(items, oldIndex, newIndex),
            });

            // We need to inform React Virtualized that the items have changed heights
            const instance = this.SortableList.getWrappedInstance();

            instance.list.recomputeRowHeights();
            instance.forceUpdate();
        }
    }

}

export default Orderable;
