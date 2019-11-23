// create a ref to get the `div` element the `VariableSizeList` uses
import React, {useState} from "react";

export default function Fragment({body, visFn}: { body: any, visFn: any }) {
    const [visible, setVisible] = useState<boolean>(true);

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
        return <></>;
    }
}
