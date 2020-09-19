// create a ref to get the `div` element the `VariableSizeList` uses
import React, {useState, useEffect} from "react";

export default function Fragment({body, visFn, defaultVisible, id}: { body: any, visFn: any, defaultVisible?: boolean, id: string }) {
    const [visible, setVisible] = useState<boolean>(defaultVisible || true);

    useEffect(() => {
        window.console.log('hi', id);
        const options = {
            root: null,
            rootMargin: '400px 0px',
            threshold: 0,
        };

        const observer = new IntersectionObserver(res => {
            if (res.length > 0) {
                setVisible(res[0].isIntersecting);
            }
        }, options);

        const el = document.getElementById(id);
        if (el) {
            observer.observe(el);
        }

        return () => {
            window.console.log('bye', id);
            observer.disconnect();
        };
    }, [id]);

    const setVis = (vis: boolean, force?: boolean) => {
        // if (visible !== vis) {
        //     setVisible(vis);
        // }
    };

    if (visFn) {
        visFn(setVis);
    }

    if (visible) {
        return (<div>{body}</div>);
    } else {
        return <div/>;
    }
}
