// create a ref to get the `div` element the `VariableSizeList` uses
import React, {useState} from "react";

export default function Fragment({body, visFn, defaultVisible}: { body: any, visFn: any, defaultVisible?: boolean }) {
    const [visible, setVisible] = useState<boolean>(defaultVisible || true);

    const setVis = (vis: boolean, force?: boolean) => {
        if (visible !== vis) {
            setVisible(vis);
        }
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
