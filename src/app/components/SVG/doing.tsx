import * as React from 'react';

export const Doing = () => {
    return (<svg className="doing-svg" viewBox="0 0 128 35">
        <g>
            <circle fill="#27ae60" cx={17.5} cy={17.5} r={17.5}/>
            <animate
                attributeName="opacity"
                dur="1200ms"
                begin="0s"
                repeatCount="indefinite"
                keyTimes="0;0.167;0.5;0.668;1"
                values="0.3;1;1;0.3;0.3"
            />
        </g>
        <g>
            <circle fill="#27ae60" cx={110.5} cy={17.5} r={17.5}/>
            <animate
                attributeName="opacity"
                dur="1200ms"
                begin="0s"
                repeatCount="indefinite"
                keyTimes="0;0.334;0.5;0.835;1"
                values="0.3;0.3;1;1;0.3"
            />
        </g>
        <g>
            <circle fill="#27ae60" cx={64} cy={17.5} r={17.5}/>
            <animate
                attributeName="opacity"
                dur="1200ms"
                begin="0s"
                repeatCount="indefinite"
                keyTimes="0;0.167;0.334;0.668;0.835;1"
                values="0.3;0.3;1;1;0.3;0.3"
            />
        </g>
    </svg>);
};