/*
    Creation Time: 2020 - Jan - 20
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {merge, pickBy} from 'lodash';

export const kValid = (arg: any) => {
    if (typeof arg === 'number') {
        return true;
    } else if (arg === undefined) {
        return false;
    } else if (arg === null) {
        return false;
    }
    return true;
};

export const kUserValid = (arg: any) => {
    if (typeof arg === 'number') {
        return true;
    } else if (arg === undefined) {
        return false;
    } else if (arg === null) {
        return false;
    } else if (arg === '') {
        return false;
    }
    return true;
};

export const kMerge = <TObject, TSource>(
    i1: TObject,
    i2: TSource
): TObject & TSource => {
    // @ts-ignore
    return merge(i1, pickBy(i2, kValid));
};

export const kUserMerge = <TObject, TSource>(
    i1: TObject,
    i2: TSource
): TObject & TSource => {
    // @ts-ignore
    return merge(i1, pickBy(i2, kUserValid));
};
