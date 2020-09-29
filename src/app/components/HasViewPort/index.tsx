// create a ref to get the `div` element the `VariableSizeList` uses
import React, {useState, useEffect, useRef} from "react";

export default function HasViewPort({children, key, height}: any) {
    const [visible, setVisible] = useState<boolean>(true);
    const ref = useRef<any>(null);

    useEffect(() => {
        if (!IntersectionObserver) {
            return;
        }
        const options = {
            root: null,
            rootMargin: "0px",
            threshold: 0,
        };

        const observer = new IntersectionObserver((res) => {
            if (res.length > 0) {
                setVisible(res[0].isIntersecting || false);
            }
        }, options);
        observer.observe(ref.current);
        return () => {
            if (observer) {
                observer.disconnect();
            }
        };
    }, [key]);

    return (<div style={{height: `${height}px`, position: 'relative'}}>
        <div ref={ref} style={{
            bottom: '-400px',
            left: 0,
            position: 'absolute',
            top: '-400px',
        }}/>
        {visible ? children : null}
    </div>);
}
