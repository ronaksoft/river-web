// create a ref to get the `div` element the `VariableSizeList` uses
import {useState} from "react";

export default function Fragment({body, visFn}: { body: any, visFn: any }) {
    const [visible, setVisible] = useState<boolean>(true);

    const setVis = (vis: boolean) => {
        if (visible !== vis) {
            setVisible(vis);
        }
    };

    if (visFn) {
        visFn(setVis);
    }

    if (visible) {
        return (body);
    } else {
        return '';
    }
}
