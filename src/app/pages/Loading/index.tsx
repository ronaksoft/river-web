/*
    Creation Time: 2018 - Oct - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import SDK from '../../services/sdk';
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import {CloseRounded} from "@material-ui/icons";
import IframeService, {C_IFRAME_SUBJECT} from "../../services/iframe";
import {Link} from "react-router-dom";
import ElectronService from "../../services/electron";
import {C_VERSION} from "../../components/SettingsMenu";
import DevTools from "../../components/DevTools";

import './style.scss';

interface IProps {
    match?: any;
    location?: any;
    history?: any;
}

interface IState {
    limit: number;
    iframeActive: boolean;
    msg: string;
    percent: number;
}

class Loading extends React.Component<IProps, IState> {
    private sdk: SDK;
    private tm: any = null;
    private iframeService: IframeService;
    private versionClickTimeout: any = null;
    private versionClickCounter: number = 0;
    private devToolsRef: DevTools | undefined;
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);

        this.iframeService = IframeService.getInstance();
        this.state = {
            iframeActive: this.iframeService.isActive(),
            limit: 0,
            msg: '',
            percent: 0,
        };
        this.sdk = SDK.getInstance();
    }

    public componentDidMount() {
        window.addEventListener('wasmInit', this.wasmInitHandler);
        window.addEventListener('authProgress', this.authProgressHandler);
        window.addEventListener('fnStarted', this.fnStartedHandler);
        this.sdk.loadConnInfo();
        if ((this.sdk.getConnInfo().UserID || 0) > 0) {
            this.props.history.push('/chat/null');
        } else if (this.sdk.getConnInfo().AuthID !== '0') {
            this.props.history.push('/signup/null');
        }

        if (!this.state.iframeActive) {
            this.eventReferences.push(this.iframeService.listen(C_IFRAME_SUBJECT.IsLoaded, (e) => {
                this.setState({
                    iframeActive: true,
                });
            }));
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('wasmInit', this.wasmInitHandler);
        window.removeEventListener('authProgress', this.authProgressHandler);
        window.removeEventListener('fnStarted', this.fnStartedHandler);
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {percent, msg, iframeActive} = this.state;
        return (
            <div className="loading-page">
                <DevTools ref={this.devToolsRefHandler}/>
                {iframeActive && <span className="close-btn">
                                    <Tooltip
                                        title="close"
                                        placement="bottom"
                                        onClick={this.closeIframeHandler}
                                    >
                                        <IconButton>
                                            <CloseRounded/>
                                        </IconButton>
                                    </Tooltip>
                                </span>}
                <div className="loading-area">
                    <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M261.912 284.828V246.094C261.912 213.785 235.627 187.5 203.318 187.5C171.01 187.5 144.725 213.785 144.725 246.094V284.828C131.085 289.666 121.287 302.691 121.287 317.969V364.844C121.287 384.229 137.058 400 156.443 400H250.193C269.579 400 285.35 384.229 285.35 364.844V317.969C285.35 302.691 275.552 289.666 261.912 284.828ZM168.162 246.094C168.162 226.709 183.933 210.938 203.318 210.938C222.704 210.938 238.475 226.709 238.475 246.094V282.812H168.162V246.094ZM261.912 364.844C261.912 371.305 256.655 376.562 250.193 376.562H156.443C149.982 376.562 144.725 371.305 144.725 364.844V317.969C144.725 311.507 149.982 306.25 156.443 306.25H250.193C256.655 306.25 261.912 311.507 261.912 317.969V364.844Z"
                            fill="#158243"/>
                        <rect x="142" y="305" width="120" height="72" fill="#158243"/>
                        {Boolean(percent > 80) && <path
                            d="M385.348 80.5961C338.85 29.5578 273.857 0 203.319 0C127.845 0 60.1642 33.775 14.326 88.5711C10.1736 93.5352 10.8314 100.926 15.7963 105.079C20.7611 109.231 28.1517 108.573 32.3041 103.609C73.4963 54.3594 134.588 23.4375 203.319 23.4375C267.66 23.4375 326.297 50.5797 368.023 96.3805C372.381 101.164 379.793 101.509 384.578 97.1508C389.362 92.7922 389.706 85.3805 385.348 80.5961Z"
                            fill="#27AE60"/>}
                        {Boolean(percent > 60) && <path
                            d="M350.662 112.14C313.142 70.9023 260.514 46.875 203.32 46.875C142.259 46.875 87.3869 74.2266 50.3439 118.602C46.1963 123.571 46.8619 130.961 51.8306 135.109C56.801 139.256 64.1892 138.59 68.3369 133.622C101.143 94.3187 149.613 70.3125 203.32 70.3125C253.805 70.3125 300.214 91.532 333.328 127.913C337.683 132.7 345.095 133.049 349.881 128.694C354.668 124.337 355.018 116.926 350.662 112.14Z"
                            fill="#27AE60"/>}
                        {Boolean(percent > 40) && <path
                            d="M315.995 143.654C287.138 111.939 246.069 93.75 203.319 93.75C158.069 93.75 115.43 113.741 86.3361 148.595C82.1885 153.564 82.8541 160.954 87.8228 165.102C92.7916 169.248 100.181 168.584 104.329 163.615C128.958 134.109 165.038 117.187 203.319 117.187C239.484 117.187 274.234 132.584 298.66 159.427C303.015 164.214 310.427 164.563 315.214 160.209C320.001 155.852 320.351 148.441 315.995 143.654Z"
                            fill="#27AE60"/>}
                        {Boolean(percent > 20) && <path
                            d="M281.325 175.173C261.347 153.217 232.916 140.625 203.319 140.625C171.994 140.625 142.476 154.464 122.334 178.593C118.187 183.562 118.852 190.952 123.821 195.099C128.79 199.248 136.18 198.581 140.326 193.613C156.003 174.833 178.962 164.062 203.319 164.062C226.33 164.062 248.443 173.861 263.989 190.947C268.344 195.734 275.757 196.083 280.544 191.728C285.33 187.372 285.68 179.96 281.325 175.173Z"
                            fill="#27AE60"/>}
                        <path
                            d="M149.32 341C149.32 311.177 173.497 287 203.32 287C233.144 287 257.32 311.177 257.32 341C257.32 370.823 233.144 395 203.32 395H155.705C152.179 395 149.32 392.141 149.32 388.616V341Z"
                            fill="#158243"/>
                        <path
                            d="M179.113 323.007V312.537H206.415C211.02 312.537 217.254 315.858 220.843 320.582C225.761 327.055 225.687 335.339 219.673 343.644L211.188 337.505C214.547 332.867 213.659 328.624 212.501 326.913C210.978 324.663 208.488 323.007 206.415 323.007H179.113Z"
                            fill="white"/>
                        <path fillRule="evenodd" clipRule="evenodd"
                              d="M207.035 312.556C206.972 312.555 206.908 312.554 206.844 312.554C206.21 312.554 205.662 312.548 205.19 312.537H179.113V323.007H206.415C208.488 323.007 210.978 324.663 212.501 326.913C213.244 328.011 213.875 330.15 213.347 332.766C213.36 332.704 213.373 332.64 213.385 332.575C214.395 326.954 215.975 314.893 209.046 312.851C208.356 312.696 207.682 312.596 207.035 312.556Z"
                              fill="#E2E2E2"/>
                        <path
                            d="M216.554 348.938C223.133 355.648 227.527 364.269 227.527 369.995H217.053C217.053 369.664 216.939 369.024 216.69 368.203C216.378 367.178 215.896 366.003 215.262 364.759C213.794 361.879 211.669 358.914 209.073 356.266C203.828 350.916 197.262 347.343 189.588 346.198V369.251H179.113C179.113 369.251 179.113 340.999 179.113 339.001C179.113 337.003 181.099 335.324 182.843 335.324C185.408 335.324 186.982 335.397 187.565 335.438C188.16 335.479 188.676 335.528 189.113 335.586C199.974 336.715 209.304 341.542 216.554 348.938Z"
                            fill="#E2E2E2"/>
                        <path fillRule="evenodd" clipRule="evenodd"
                              d="M222.781 356.821C221.068 354.094 218.957 351.389 216.554 348.938C209.304 341.542 199.974 336.715 189.113 335.586C188.676 335.528 188.16 335.479 187.565 335.438C186.982 335.397 185.408 335.324 182.843 335.324C181.099 335.324 179.113 337.003 179.113 339.001V369.995H189.588V348.938C189.588 346.14 190.553 346.342 191.095 346.456C191.122 346.462 191.147 346.467 191.171 346.472C192.316 346.697 193.435 346.978 194.527 347.311C202.501 348.116 217.671 350.751 222.781 356.821Z"
                              fill="white"/>
                    </svg>
                    <div className="loading-text">
                        Securing connection<br/>
                        {msg === '' && <span className="info">It might take up to 60 seconds!</span>}
                        {msg !== '' && <span className="info">{msg}</span>}
                    </div>
                    {Boolean(ElectronService.isElectron() && false) && <div className="loading-link">
                        <Link to={'/signup/workspace'}>Change Workspace</Link>
                    </div>}
                </div>
                <div className="version-container" onClick={this.versionClickHandler}>{C_VERSION}</div>
            </div>
        );
    }

    private increase = () => {
        clearTimeout(this.tm);
        const percent = this.state.percent + 1;
        if (percent >= this.state.limit) {
            clearTimeout(this.tm);
            return;
        }
        this.setState({percent});
        this.tm = setTimeout(this.increase, 10);
    }

    private wasmInitHandler = () => {
        // this.sdk.authRecall('0');
    }

    private authProgressHandler = (event: any) => {
        const percent = event.detail.progress;
        this.setState({
            limit: percent + 5,
        }, () => {
            this.increase();
        });
    }

    private fnStartedHandler = (event: any) => {
        const duration = event.detail.duration;
        if (duration === -1) {
            if ((this.sdk.getConnInfo().UserID || 0) > 0) {
                this.props.history.push('/chat/null');
            } else {
                this.props.history.push('/signup/null');
            }
        } else {
            this.setState({
                msg: `It took ${duration} seconds to secure your connection`,
            });
            setTimeout(() => {
                if ((this.sdk.getConnInfo().UserID || 0) > 0) {
                    this.props.history.push('/chat/null');
                } else {
                    this.props.history.push('/signup/null');
                }
            }, 3000);
        }
    }

    private closeIframeHandler = () => {
        this.iframeService.close();
    }

    /* DevTools ref handler */
    private devToolsRefHandler = (ref: any) => {
        this.devToolsRef = ref;
    }

    /* Version click handler */
    private versionClickHandler = () => {
        if (!this.versionClickTimeout) {
            this.versionClickTimeout = setTimeout(() => {
                clearTimeout(this.versionClickTimeout);
                this.versionClickTimeout = null;
                this.versionClickCounter = 0;
            }, 6000);
        }
        this.versionClickCounter++;
        if (this.versionClickCounter >= 10) {
            clearTimeout(this.versionClickTimeout);
            this.versionClickTimeout = null;
            this.versionClickCounter = 0;
            if (this.devToolsRef) {
                this.devToolsRef.open();
            }
        }
    }
}

export default Loading;
