import React from 'react';

export const ThreeDot = (props: any) => {
    return (<svg viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}
                 style={{height: '1em', width: '1em'}}>
        <path
            d="M8.92043 5C8.92043 7.21669 7.13986 9 4.96021 9C2.78056 9 1 7.21669 1 5C1 2.78331 2.78056 1 4.96021 1C7.13986 1 8.92043 2.78331 8.92043 5Z"
            style={{stroke: 'currentColor'}} strokeWidth="2"/>
        <path
            d="M22.8091 5C22.8091 7.21669 21.0285 9 18.8489 9C16.6692 9 14.8887 7.21669 14.8887 5C14.8887 2.78331 16.6692 1 18.8489 1C21.0285 1 22.8091 2.78331 22.8091 5Z"
            style={{stroke: 'currentColor'}} strokeWidth="2"/>
        <path
            d="M36.6978 5C36.6978 7.21669 34.9172 9 32.7375 9C30.5579 9 28.7773 7.21669 28.7773 5C28.7773 2.78331 30.5579 1 32.7375 1C34.9172 1 36.6978 2.78331 36.6978 5Z"
            style={{stroke: 'currentColor'}} strokeWidth="2"/>
    </svg>);
};

