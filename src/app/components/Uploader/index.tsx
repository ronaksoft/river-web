import * as React from 'react';
// @ts-ignore
import Gallery from 'react-fine-uploader';
// @ts-ignore
import FineUploaderTraditional from 'fine-uploader-wrappers';
import './style.css';

interface IProps {
    items?: any[];
}

interface IState {
    items?: any[];
}

const uploader = new FineUploaderTraditional({
    options: {
        autoUpload: false,
        chunking: {
            enabled: true
        },
        deleteFile: {
            enabled: true,
            endpoint: '/uploads'
        },
        request: {
            endpoint: '/uploads'
        },
        retry: {
            enableAuto: true
        },
    }
});

class Uploader extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            items: props.items,
        };
    }

    // public componentWillReceiveProps(newProps: IProps) {
    //     this.setState({
    //         items: newProps.items,
    //         selectedId: newProps.selectedId,
    //     }, () => {
    //         this.list.recomputeRowHeights();
    //     });
    // }

    public render() {
        return (
            <Gallery uploader={uploader} disable-status={true} />
        );
    }
}

export default Uploader;