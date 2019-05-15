import {merge, pickBy, identity} from 'lodash';

export const kMerge = <TObject, TSource>(
    i1: TObject,
    i2: TSource
): TObject & TSource => {
    // @ts-ignore
    return merge(i1, pickBy(i2, identity));
};
