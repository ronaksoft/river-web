// @ts-ignore
import {Picker as EmojiPicker} from 'emoji-mart';

const EmojiContainer = ({onSelect, dark}: {onSelect: any, dark: boolean}) => {
    return <EmojiPicker custom={[]} onSelect={onSelect} native={true}
                 showPreview={false} theme={dark ? 'dark' : 'light'}/>;
};

export default EmojiContainer;