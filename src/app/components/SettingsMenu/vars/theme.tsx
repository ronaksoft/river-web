import * as React from 'react';

import bg1 from '../../../../asset/image/bgpic/bg1.jpg';
import bg2 from '../../../../asset/image/bgpic/bg2.jpg';
import bg3 from '../../../../asset/image/bgpic/bg3.jpg';
import bg4 from '../../../../asset/image/bgpic/bg4.jpg';
import bg5 from '../../../../asset/image/bgpic/bg5.jpg';
import bg6 from '../../../../asset/image/bgpic/bg6.jpg';
import bg7 from '../../../../asset/image/bgpic/bg7.jpg';
import bg8 from '../../../../asset/image/bgpic/bg8.jpg';

import lbg1 from '../../../../asset/image/bgl/4-point-stars.svg';
import dbg1 from '../../../../asset/image/bgd/4-point-stars.svg';
import lbg2 from '../../../../asset/image/bgl/anchors-away.svg';
import dbg2 from '../../../../asset/image/bgd/anchors-away.svg';
import lbg3 from '../../../../asset/image/bgl/bank-note.svg';
import dbg3 from '../../../../asset/image/bgd/bank-note.svg';
import lbg4 from '../../../../asset/image/bgl/bubbles.svg';
import dbg4 from '../../../../asset/image/bgd/bubbles.svg';
import lbg5 from '../../../../asset/image/bgl/glamorous.svg';
import dbg5 from '../../../../asset/image/bgd/glamorous.svg';
import lbg6 from '../../../../asset/image/bgl/hideout.svg';
import dbg6 from '../../../../asset/image/bgd/hideout.svg';
import lbg7 from '../../../../asset/image/bgl/i-like-food.svg';
import dbg7 from '../../../../asset/image/bgd/i-like-food.svg';
import lbg8 from '../../../../asset/image/bgl/jigsaw.svg';
import dbg8 from '../../../../asset/image/bgd/jigsaw.svg';
import lbg9 from '../../../../asset/image/bgl/plus.svg';
import dbg9 from '../../../../asset/image/bgd/plus.svg';
import lbg10 from '../../../../asset/image/bgl/rounded-plus-connected.svg';
import dbg10 from '../../../../asset/image/bgd/rounded-plus-connected.svg';
import lbg11 from '../../../../asset/image/bgl/skulls.svg';
import dbg11 from '../../../../asset/image/bgd/skulls.svg';
import lbg12 from '../../../../asset/image/bgl/squares-in-squares.svg';
import dbg12 from '../../../../asset/image/bgd/squares-in-squares.svg';
import lbg13 from '../../../../asset/image/bgl/tic-tac-toe.svg';
import dbg13 from '../../../../asset/image/bgd/tic-tac-toe.svg';
import lbg14 from '../../../../asset/image/bgl/topography.svg';
import dbg14 from '../../../../asset/image/bgd/topography.svg';
import lriverbg from '../../../../asset/image/bgl/pattern.png';
import driverbg from '../../../../asset/image/pattern.png';

import {
    GroupRounded,
    ForwardRounded,
    VisibilityRounded,
    SimCardRounded,
    PersonRounded,
    CallRounded,
} from '@material-ui/icons';

export const C_CUSTOM_BG = '21';

export const bgTypes = [{
    id: '0',
    title: 'settings.none',
}, {
    id: '1',
    title: 'settings.custom',
}, {
    id: '2',
    title: 'settings.pattern',
}];

export const backgrounds = [{
    id: '15',
    src: {
        d: driverbg,
        l: lriverbg,
    },
    title: 'River',
}, {
    id: '1',
    src: {
        d: dbg1,
        l: lbg1,
    },
    title: '4 Point Star',
}, {
    id: '2',
    src: {
        d: dbg2,
        l: lbg2,
    },
    title: 'Anchors Away',
}, {
    id: '3',
    src: {
        d: dbg3,
        l: lbg3,
    },
    title: 'Bank Note',
}, {
    id: '4',
    src: {
        d: dbg4,
        l: lbg4,
    },
    title: 'Bubbles',
}, {
    id: '5',
    src: {
        d: dbg5,
        l: lbg5,
    },
    title: 'Glamorous',
}, {
    id: '6',
    src: {
        d: dbg6,
        l: lbg6,
    },
    title: 'Hideout',
}, {
    id: '7',
    src: {
        d: dbg7,
        l: lbg7,
    },
    title: 'I Like Food',
}, {
    id: '8',
    src: {
        d: dbg8,
        l: lbg8,
    },
    title: 'Jigsaw',
}, {
    id: '9',
    src: {
        d: dbg9,
        l: lbg9,
    },
    title: 'Plus',
}, {
    id: '10',
    src: {
        d: dbg10,
        l: lbg10,
    },
    title: 'Rounded Plus Connected',
}, {
    id: '11',
    src: {
        d: dbg11,
        l: lbg11,
    },
    title: 'Skulls',
}, {
    id: '12',
    src: {
        d: dbg12,
        l: lbg12,
    },
    title: 'Squares in Squares',
}, {
    id: '13',
    src: {
        d: dbg13,
        l: lbg13,
    },
    title: 'Tic Tac Toe',
}, {
    id: '14',
    src: {
        d: dbg14,
        l: lbg14,
    },
    title: 'Topography',
}];

export const bubbles = [{
    id: '4',
    title: 'settings.pad'
}, {
    id: '1',
    title: 'settings.kk'
}, {
    id: '2',
    title: 'settings.curve'
}, {
    id: '5',
    title: 'settings.simplified'
}];

export const gradients = [{
    id: '0',
    title: 'settings.none'
}, {
    id: '1',
    title: 'settings.morning'
}, {
    id: '2',
    title: 'settings.venice'
}, {
    id: '3',
    title: 'settings.paradise'
}, {
    id: '4',
    title: 'settings.ocean'
}, {
    id: '5',
    title: 'settings.rainbow'
}];

export const themes = [{
    id: 'light',
    title: 'settings.light'
}, {
    id: 'dark-night',
    title: 'settings.dark_night'
}, {
    id: 'dark',
    title: 'settings.dark'
}, {
    id: 'dark-blue',
    title: 'settings.dark_blue'
}];

export const reactions = [{
    id: '0',
    title: 'settings.small'
}, {
    id: '1',
    title: 'settings.medium'
}, {
    id: '2',
    title: 'settings.large'
}];

export const bgPics = [{
    id: '1',
    src: bg1
}, {
    id: '2',
    src: bg2
}, {
    id: '3',
    src: bg3
}, {
    id: '4',
    src: bg4
}, {
    id: '5',
    src: bg5
}, {
    id: '6',
    src: bg6
}, {
    id: '7',
    src: bg7
}, {
    id: '8',
    src: bg8
}];

export const storageItems = [{
    className: 'bold',
    id: 'download_all',
    title: 'settings.auto_download_media',
    type: 'item',
}, {
    id: 'h1',
    title: 'settings.private_chats',
    type: 'header',
}, {
    id: 'chat_photos',
    title: 'settings.photos',
    type: 'item',
}, {
    id: 'chat_videos',
    title: 'settings.videos',
    type: 'item',
}, {
    id: 'chat_voices',
    title: 'settings.voices',
    type: 'item',
}, {
    id: 'chat_gifs',
    title: 'settings.gifs',
    type: 'item',
}, {
    id: 'chat_files',
    title: 'settings.files',
    type: 'item',
}, {
    id: 'h2',
    title: 'settings.group_chats',
    type: 'header',
}, {
    id: 'group_photos',
    title: 'settings.photos',
    type: 'item',
}, {
    id: 'group_videos',
    title: 'settings.videos',
    type: 'item',
}, {
    id: 'group_voices',
    title: 'settings.voices',
    type: 'item',
}, {
    id: 'group_gifs',
    title: 'settings.gifs',
    type: 'item',
}, {
    id: 'group_files',
    title: 'settings.files',
    type: 'item',
}, {
    id: 'h3',
    title: 'settings.auto_save',
    type: 'header',
}, {
    id: 'auto_save_files',
    title: 'settings.files',
    type: 'item',
}];

export const privacyItems = [{
    color: '#3AB4EB',
    hint: 'settings.privacy_chat_invite_hint',
    icon: <GroupRounded/>,
    id: 'privacy_chat_invite',
    title: 'settings.privacy_chat_invite',
}, {
    color: '#FF7D00',
    hint: 'settings.privacy_forwarded_message_hint',
    icon: <ForwardRounded/>,
    id: 'privacy_forwarded_message',
    title: 'settings.privacy_forwarded_message',
}, {
    color: '#7479EA',
    hint: 'settings.privacy_last_seen_hint',
    icon: <VisibilityRounded/>,
    id: 'privacy_last_seen',
    title: 'settings.privacy_last_seen',
}, {
    color: '#FFD501',
    hint: 'settings.privacy_phone_number_hint',
    icon: <SimCardRounded/>,
    id: 'privacy_phone_number',
    title: 'settings.privacy_phone_number',
}, {
    color: '#F75176',
    hint: 'settings.privacy_profile_photo_hint',
    icon: <PersonRounded/>,
    id: 'privacy_profile_photo',
    title: 'settings.privacy_profile_photo',
}, {
    color: '#27AE60',
    hint: 'settings.privacy_call_hint',
    icon: <CallRounded/>,
    id: 'privacy_call',
    title: 'settings.privacy_call',
}];

export const privacyRuleItems = [{
    id: 'everyone',
    title: 'settings.privacy_everyone'
}, {
    id: 'my_contacts',
    title: 'settings.privacy_my_contacts'
}, {
    id: 'no_one',
    title: 'settings.privacy_no_one'
}];

export const lastSeenFormat = [{
    hint: 'settings.last_seen.estimated_hint',
    id: 'estimated',
    title: 'settings.last_seen.estimated'
}, {
    hint: 'settings.last_seen.exact_hint',
    id: 'exact',
    title: 'settings.last_seen.exact'
}];