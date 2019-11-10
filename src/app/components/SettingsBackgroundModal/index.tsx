/*
    Creation Time: 2019 - April - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import GridList from '@material-ui/core/GridList/GridList';
import {backgrounds, bgPics, C_CUSTOM_BG} from '../SettingsMenu/vars/theme';
import GridListTile from '@material-ui/core/GridListTile/GridListTile';
import SettingsModal from '../SettingsModal';
import {
    AddRounded, BlurOnRounded, CheckRounded,
} from '@material-ui/icons';

import Slider from '@material-ui/lab/Slider/Slider';
import {throttle} from 'lodash';
import BackgroundService from '../../services/backgroundService';
// @ts-ignore
import glur from 'glur';
import {C_CUSTOM_BG_ID} from '../SettingsMenu';
import i18n from '../../services/i18n';

import './style.scss';

interface IBlur {
    blob: Blob;
    preview: string;
}

export interface ICustomBackground {
    blob: Blob;
    blur: number;
    id: string;
}

interface IProps {
    dark: boolean;
    defBlur?: number;
    defId?: string;
    defPatternId?: string;
    onDone: (data: ICustomBackground) => void;
    onPatternSelected: (id: string) => void;
}

interface IState {
    blurAmount: number;
    blurSrc?: string;
    openBackgroundModal: boolean;
    openCustomizeModal: boolean;
    openPatternModal: boolean;
    selectedPattern: string;
    selectedPic: string;
    src: string;
    uploadedSrc: string;
}

class SettingsBackgroundModal extends React.Component<IProps, IState> {
    private readonly blurThrottle: any;
    private lastPreview: string = '';
    private imageBlob: any;
    private inputRef: any = null;
    private backgroundService: BackgroundService;

    constructor(props: IProps) {
        super(props);

        this.state = {
            blurAmount: props.defBlur || 0,
            openBackgroundModal: false,
            openCustomizeModal: false,
            openPatternModal: false,
            selectedPattern: props.defPatternId || '-1',
            selectedPic: props.defId || '-1',
            src: '',
            uploadedSrc: '',
        };

        this.blurThrottle = throttle(this.blurImage, 256);
        this.backgroundService = BackgroundService.getInstance();
    }

    public componentDidMount() {
        if (this.state.selectedPattern === C_CUSTOM_BG && this.state.selectedPic === '-21') {
            this.backgroundService.getBackground(C_CUSTOM_BG_ID).then((res) => {
                const src = URL.createObjectURL(res);
                this.setState({
                    src,
                    uploadedSrc: src,
                }, () => {
                    this.selectBackgroundPicHandler('-21')();
                });
            });
        }
    }

    public openDialog(pattern?: boolean) {
        if (pattern) {
            this.setState({
                openPatternModal: true,
            });
        } else {
            this.setState({
                openBackgroundModal: true,
            });
        }
    }

    public render() {
        const {blurAmount, openBackgroundModal, openCustomizeModal, selectedPic, selectedPattern, openPatternModal, src, blurSrc, uploadedSrc} = this.state;
        return (
            <React.Fragment>
                <input ref={this.inputRefHandler} type="file" onChange={this.inputChangeHandler}
                       accept="image/jpeg,image/png,image/svg" style={{display: 'none'}}/>
                <SettingsModal open={openBackgroundModal} title={i18n.t('settings.chat_background')}
                               onClose={this.backgroundModalCloseHandler}>
                    <div className="bg-pic-container">
                        <GridList cellHeight={100} spacing={6} cols={3}>
                            {bgPics.map((pic, index) => (
                                <GridListTile key={index} cols={1} rows={1}>
                                    <div
                                        className={'item' + (selectedPic === pic.id ? ' selected' : '')}
                                        onClick={this.selectBackgroundPicHandler(pic.id)}>
                                        <div className="customize" onClick={this.customizeBackgroundHandler}>
                                            <BlurOnRounded/>
                                        </div>
                                        <img src={pic.src} alt="sample"/>
                                    </div>
                                </GridListTile>
                            ))}
                            <GridListTile key={8} cols={1} rows={1}>
                                {Boolean(uploadedSrc !== '') &&
                                <div className={'item uploaded-file' + (selectedPic === '-21' ? ' selected' : '')}
                                     onClick={this.selectBackgroundPicHandler('-21')}>
                                    <div className="customize" onClick={this.customizeBackgroundHandler}>
                                        <BlurOnRounded/>
                                    </div>
                                    <div className="add-icon" onClick={this.uploadBackgroundHandler}>
                                        <AddRounded/>
                                    </div>
                                    <img src={uploadedSrc} alt="sample"/>
                                </div>}
                                {Boolean(uploadedSrc === '') && <div className="item upload-file">
                                    <div className="add-icon" onClick={this.uploadBackgroundHandler}>
                                        <AddRounded/>
                                    </div>
                                </div>}
                            </GridListTile>
                        </GridList>
                    </div>
                </SettingsModal>
                <SettingsModal open={openCustomizeModal} title={i18n.t('settings.customized_background')}
                               onClose={this.customizeModalCloseHandler} icon={<BlurOnRounded/>}>
                    <div className="customize-background-container">
                        <div className="img">
                            <img src={blurSrc || src} alt="blur"/>
                            <div className="blur-action">
                                <div className="action" onClick={this.doneHandler}>
                                    <CheckRounded/>
                                </div>
                                <div className="blur-seeker">
                                    <Slider
                                        value={blurAmount}
                                        min={0}
                                        max={64}
                                        step={1}
                                        aria-labelledby="label"
                                        onChange={this.blurAmountChangeHandler}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </SettingsModal>
                <SettingsModal open={openPatternModal} title="Background Pattern"
                               onClose={this.patternModalCloseHandler}>
                    <div className="bg-pic-container bg-pattern">
                        <GridList cellHeight={100} spacing={6} cols={3}>
                            {backgrounds.map((pic, index) => (
                                <GridListTile key={index} cols={1} rows={1}>
                                    <div
                                        className={'item' + (selectedPattern === pic.id ? ' selected' : '')}
                                        onClick={this.selectPatternHandler(pic.id)}>
                                        {this.props.dark && <img src={pic.src.l} alt="light"/>}
                                        {!this.props.dark && <img src={pic.src.d} alt="dark"/>}
                                    </div>
                                </GridListTile>
                            ))}
                        </GridList>
                    </div>
                </SettingsModal>
            </React.Fragment>
        );
    }

    private selectBackgroundPicHandler = (id: string) => (e?: any) => {
        const bg = bgPics.find((o) => o.id === id);
        const tSrc = (id === '-21') ? this.state.uploadedSrc : (bg ? bg.src : '');
        this.setState({
            selectedPic: id,
            src: tSrc,
        }, () => {
            const {src} = this.state;
            if (src !== '') {
                this.imageToBlob(src).then((res) => {
                    this.props.onDone({
                        blob: res,
                        blur: this.state.blurAmount,
                        id: this.state.selectedPic,
                    });
                });
            }
        });
    }

    private selectPatternHandler = (id: string) => (e: any) => {
        this.setState({
            selectedPattern: id,
        });
        this.props.onPatternSelected(id);
    }

    private backgroundModalCloseHandler = () => {
        this.setState({
            openBackgroundModal: false,
        });
    }

    private customizeModalCloseHandler = () => {
        this.setState({
            openBackgroundModal: true,
            openCustomizeModal: false,
        });
    }

    private customizeBackgroundHandler = () => {
        this.setState({
            blurAmount: 0,
            blurSrc: undefined,
            openBackgroundModal: false,
            openCustomizeModal: true,
        });
    }

    private patternModalCloseHandler = () => {
        this.setState({
            openPatternModal: false,
        });
    }

    private blurAmountChangeHandler = (e: any, value: number) => {
        this.setState({
            blurAmount: value,
        }, () => {
            this.blurThrottle();
        });
    }

    private blurImage = () => {
        const {src, blurAmount} = this.state;
        if (src !== '') {
            this.createBlurredImage(src, Math.floor(blurAmount)).then((res) => {
                this.imageBlob = res.blob;
                this.setState({
                    blurSrc: res.preview,
                });
            });
        }
    }

    private createBlurredImage(src: string, radius: number): Promise<IBlur> {
        return new Promise<IBlur>((resolve, reject) => {
            const canvas: HTMLCanvasElement = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject('no ctx');
            }
            const img = new Image();
            img.onload = () => {
                ctx.canvas.height = img.height;
                ctx.canvas.width = img.width;
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                glur(imageData.data, img.width, img.height, radius);
                ctx.putImageData(imageData, 0, 0);
                canvas.toBlob((data) => {
                    if (data) {
                        URL.revokeObjectURL(this.lastPreview);
                        const preview = URL.createObjectURL(data);
                        resolve({
                            blob: data,
                            preview,
                        });
                    } else {
                        reject('cannot create blob');
                    }
                    img.remove();
                }, 'image/jpeg', 0.9);
            };
            img.src = src;
        });
    }

    private imageToBlob(src: string): Promise<Blob> {
        return new Promise<Blob>((resolve, reject) => {
            const canvas: HTMLCanvasElement = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject('no ctx');
            }
            const img = new Image();
            img.onload = () => {
                ctx.canvas.height = img.height;
                ctx.canvas.width = img.width;
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((data) => {
                    if (data) {
                        resolve(data);
                    } else {
                        reject('cannot create blob');
                    }
                    img.remove();
                }, 'image/jpeg', 0.9);
            };
            img.src = src;
        });
    }

    private doneHandler = () => {
        this.props.onDone({
            blob: this.imageBlob,
            blur: this.state.blurAmount,
            id: this.state.selectedPic,
        });
        this.setState({
            blurAmount: 0,
            blurSrc: undefined,
            openBackgroundModal: false,
            openCustomizeModal: false,
        });
    }

    private inputRefHandler = (ref: any) => {
        this.inputRef = ref;
    }

    private uploadBackgroundHandler = () => {
        if (this.inputRef) {
            this.inputRef.click();
        }
    }

    private inputChangeHandler = (e: any) => {
        if (e.currentTarget.files.length > 0) {
            URL.revokeObjectURL(this.state.uploadedSrc);
            const src = URL.createObjectURL(e.currentTarget.files[0]);
            this.setState({
                src,
                uploadedSrc: src,
            }, () => {
                this.selectBackgroundPicHandler('-21')();
            });
        }
    }
}

export default SettingsBackgroundModal;
