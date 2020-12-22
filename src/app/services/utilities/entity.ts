import {clone, uniq, orderBy} from 'lodash';
import {MessageEntity} from "../sdk/messages/core.types_pb";

export interface ITypedRange {
    start: number;
    end: number;
    types: number[];
    id?: string;
}

const intersectRange = (r1: ITypedRange, r2: ITypedRange): ITypedRange[] | null => {
    const start = r1.start;
    const end = r1.end;
    const otherStart = r2.start;
    const otherEnd = r2.end;
    const isZeroLength = (start === end);
    const isOtherZeroLength = (otherStart === otherEnd);
    if (isZeroLength || isOtherZeroLength) {
        return null;
    }

    const types = uniq([...r1.types, ...r2.types]);

    // start 5 otherStart 6 end 12 otherEnd 16
    // Non zero-length ranges
    if ((start <= otherStart) && (otherStart < end) && (end < otherEnd)) {
        if (start !== otherStart) {
            return [{end: otherStart, start, types: r1.types}, {end, start: otherStart, types}, {
                end: otherEnd,
                start: end,
                types: r2.types
            }];
        } else {
            return [{end, start: otherStart, types}, {end: otherEnd, start: end, types: r2.types}];
        }
    } else if ((start <= otherStart) && (otherStart <= otherEnd) && (otherEnd <= end)) {
        if (start === otherStart && end === otherEnd) {
            return [{end: otherEnd, start: otherStart, types}];
        } else if (start === otherStart && end !== otherEnd) {
            return [{end: otherEnd, start: otherStart, types}, {end, start: otherEnd, types: r2.types}];
        } else if (start !== otherStart && end === otherEnd) {
            return [{end: otherStart, start, types: r1.types}, {end: otherEnd, start: otherStart, types}];
        } else {
            return [{end: otherStart, start, types: r1.types}, {
                end: otherEnd,
                start: otherStart,
                types
            }, {end, start: otherEnd, types: r2.types}];
        }
    }

    return null;
};

const extractRanges = (ranges: ITypedRange[]): ITypedRange[] => {
    for (let i = 1; i < ranges.length;) {
        const overlap = intersectRange(ranges[i - 1], ranges[i]);
        if (overlap) {
            ranges.splice(i - 1, 2, ...overlap);
            ranges = orderBy(ranges, ['start']);
        }
        i++;
    }
    return ranges;
};

export const spanMessageEntities = (body: string, entityList: any[]): any[] => {
    let sortedEntities = clone(entityList);
    // Sort fragments from entities
    sortedEntities = orderBy(sortedEntities, ['offset'], ['asc']);
    const elems: any[] = [];
    const bodyLen = body.length - 1;
    sortedEntities = extractRanges(sortedEntities.map((se: MessageEntity.AsObject) => {
        return {
            end: (se.offset || 0) + (se.length || 0),
            id: se.userid,
            start: (se.offset || 0),
            types: [se.type || 0],
        };
    }));
    sortedEntities = sortedEntities.map((se: ITypedRange) => {
        return {
            length: se.end - se.start,
            offset: se.start,
            type: undefined,
            types: se.types,
            userid: se.id,
        };
    });
    // Put fragments in order
    sortedEntities.forEach((entity, i) => {
        if (i === 0 && entity.offset !== 0) {
            elems.push({
                str: body.substr(0, entity.offset),
                type: -1,
            });
        }
        if (i > 0 && i < bodyLen && ((sortedEntities[i - 1].offset || 0) + (sortedEntities[i - 1].length || 0)) !== (entity.offset || 0)) {
            elems.push({
                str: body.substr((sortedEntities[i - 1].offset || 0) + (sortedEntities[i - 1].length || 0), (entity.offset || 0) - ((sortedEntities[i - 1].offset || 0) + (sortedEntities[i - 1].length || 0))),
                type: -1,
            });
        }
        if (entity.types.length === 1) {
            elems.push({
                str: body.substr(entity.offset || 0, (entity.length || 0)),
                type: entity.types[0],
                userId: entity.userid,
            });
        } else {
            elems.push({
                str: body.substr(entity.offset || 0, (entity.length || 0)),
                types: entity.types,
                userId: entity.userid,
            });
        }
        if (i === (sortedEntities.length - 1) && (bodyLen) !== (entity.offset || 0) + (entity.length || 0)) {
            elems.push({
                str: body.substr((entity.offset || 0) + (entity.length || 0)),
                type: -1,
            });
        }
    });
    return elems;
};