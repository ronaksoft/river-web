import * as React from 'react';
import {useEffect, useState} from "react";
import {C_LOCALSTORAGE} from "../../services/sdk/const";
import Broadcaster from "../../services/broadcaster";
import {ThemeChanged} from "../SettingsMenu";

export const RiverTextLogo = () => {
    const [dark, setDark] = useState((localStorage.getItem(C_LOCALSTORAGE.ThemeColor) || 'light') !== 'light');

    useEffect(() => {
        const fn = Broadcaster.getInstance().listen(ThemeChanged, themeChangeHandler);
        return () => {
            if (fn) {
                fn();
            }
        };
    }, []);

    const themeChangeHandler = () => {
        setDark((localStorage.getItem(C_LOCALSTORAGE.ThemeColor) || 'light') !== 'light');
    };

    return (<svg width="45" height="20" viewBox="0 0 45 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M1.736 15C1.472 15 1.25 14.91 1.07 14.73C0.89 14.55 0.8 14.328 0.8 14.064V1.878C0.8 1.602 0.89 1.38 1.07 1.212C1.25 1.032 1.472 0.942 1.736 0.942H4.976C5.876 0.942 6.674 1.134 7.37 1.518C8.066 1.89 8.606 2.406 8.99 3.066C9.386 3.726 9.584 4.494 9.584 5.37C9.584 6.234 9.368 6.996 8.936 7.656C8.504 8.304 7.916 8.796 7.172 9.132L9.926 13.56C10.142 13.908 10.172 14.238 10.016 14.55C9.86 14.85 9.59 15 9.206 15C8.858 15 8.588 14.85 8.396 14.55L5.3 9.582C5.192 9.582 5.084 9.582 4.976 9.582H2.672V14.064C2.672 14.328 2.582 14.55 2.402 14.73C2.234 14.91 2.012 15 1.736 15ZM2.672 7.854H4.976C5.792 7.854 6.464 7.626 6.992 7.17C7.52 6.702 7.784 6.102 7.784 5.37C7.784 4.578 7.52 3.93 6.992 3.426C6.464 2.922 5.792 2.67 4.976 2.67H2.672V7.854ZM13.091 15C12.827 15 12.605 14.916 12.425 14.748C12.257 14.568 12.173 14.346 12.173 14.082V6.072C12.173 5.796 12.257 5.574 12.425 5.406C12.605 5.238 12.827 5.154 13.091 5.154C13.367 5.154 13.589 5.238 13.757 5.406C13.925 5.574 14.009 5.796 14.009 6.072V14.082C14.009 14.346 13.925 14.568 13.757 14.748C13.589 14.916 13.367 15 13.091 15ZM13.091 3.552C12.767 3.552 12.485 3.438 12.245 3.21C12.017 2.97 11.903 2.688 11.903 2.364C11.903 2.04 12.017 1.764 12.245 1.536C12.485 1.296 12.767 1.176 13.091 1.176C13.415 1.176 13.691 1.296 13.919 1.536C14.159 1.764 14.279 2.04 14.279 2.364C14.279 2.688 14.159 2.97 13.919 3.21C13.691 3.438 13.415 3.552 13.091 3.552ZM20.7547 14.982C20.3827 14.982 20.0947 14.784 19.8907 14.388L16.0747 6.342C15.9787 6.138 15.9667 5.94 16.0387 5.748C16.1227 5.544 16.2787 5.388 16.5067 5.28C16.7107 5.172 16.9147 5.154 17.1187 5.226C17.3347 5.298 17.4967 5.436 17.6047 5.64L20.7367 12.39L23.8327 5.64C23.9407 5.436 24.1027 5.298 24.3187 5.226C24.5467 5.154 24.7747 5.172 25.0027 5.28C25.2187 5.376 25.3627 5.526 25.4347 5.73C25.5067 5.934 25.4947 6.138 25.3987 6.342L21.5827 14.388C21.4027 14.784 21.1267 14.982 20.7547 14.982ZM31.5605 15.072C30.5645 15.072 29.6765 14.862 28.8965 14.442C28.1285 14.01 27.5225 13.422 27.0785 12.678C26.6465 11.922 26.4305 11.058 26.4305 10.086C26.4305 9.102 26.6345 8.238 27.0425 7.494C27.4625 6.738 28.0385 6.15 28.7705 5.73C29.5025 5.298 30.3425 5.082 31.2905 5.082C32.2265 5.082 33.0305 5.292 33.7025 5.712C34.3745 6.12 34.8845 6.69 35.2325 7.422C35.5925 8.142 35.7725 8.976 35.7725 9.924C35.7725 10.152 35.6945 10.344 35.5385 10.5C35.3825 10.644 35.1845 10.716 34.9445 10.716H28.1045C28.2365 11.544 28.6145 12.222 29.2385 12.75C29.8745 13.266 30.6485 13.524 31.5605 13.524C31.9325 13.524 32.3105 13.458 32.6945 13.326C33.0905 13.182 33.4085 13.02 33.6485 12.84C33.8285 12.708 34.0205 12.642 34.2245 12.642C34.4405 12.63 34.6265 12.69 34.7825 12.822C34.9865 13.002 35.0945 13.2 35.1065 13.416C35.1185 13.632 35.0225 13.818 34.8185 13.974C34.4105 14.298 33.9005 14.562 33.2885 14.766C32.6885 14.97 32.1125 15.072 31.5605 15.072ZM31.2905 6.63C30.4025 6.63 29.6885 6.876 29.1485 7.368C28.6085 7.86 28.2665 8.496 28.1225 9.276H34.1165C34.0085 8.508 33.7145 7.878 33.2345 7.386C32.7545 6.882 32.1065 6.63 31.2905 6.63ZM39.0141 15C38.4141 15 38.1141 14.7 38.1141 14.1V6.054C38.1141 5.454 38.4141 5.154 39.0141 5.154C39.6141 5.154 39.9141 5.454 39.9141 6.054V6.396C40.2741 5.976 40.7121 5.646 41.2281 5.406C41.7561 5.166 42.3261 5.046 42.9381 5.046C43.6581 5.046 44.1921 5.166 44.5401 5.406C44.9001 5.634 45.0381 5.91 44.9541 6.234C44.8941 6.486 44.7741 6.654 44.5941 6.738C44.4141 6.81 44.2041 6.822 43.9641 6.774C43.1961 6.618 42.5061 6.606 41.8941 6.738C41.2821 6.87 40.7961 7.116 40.4361 7.476C40.0881 7.836 39.9141 8.292 39.9141 8.844V14.1C39.9141 14.7 39.6141 15 39.0141 15Z"
            fill={dark ? '#ddd' : '#333'}/>
    </svg>);
};