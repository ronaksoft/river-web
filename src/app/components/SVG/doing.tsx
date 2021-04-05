export const Doing = () => {
    return (<svg className="doing-svg" viewBox="0 0 128 35">
        <g>
            <circle cx={17.5} cy={17.5} r={15}/>
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
            <circle cx={110.5} cy={17.5} r={15}/>
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
            <circle cx={64} cy={17.5} r={15}/>
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