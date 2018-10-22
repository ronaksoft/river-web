/**
 * @file utilities/time.tsx
 * @author Hamidreza KK <hamidrezakks@gmail.com>
 * @desc Tools for formatting a timestamp
 * @export {TimeUntiles}
 * Documented by: Hamidreza KK
 * Date of documentation:  2018-09-30
 */
import * as moment from 'moment';

/**
 * @class TimeUntiles
 * @desc Formats a timestamp (usually provided by Cyrus) in full and dynamic formats
 */
class TimeUntiles {

    /**
     * @func full
     * @desc Formats the given timestamp in full mode
     * @param {number} timestamp
     * @returns {string}
     * @memberof TimeUntiles
     */
    public full(timestamp: number) {
        return moment(timestamp).format('dddd, MMMM DD YYYY, HH:mm');
    }

    public fullOnlyDate(timestamp: number) {
        return moment(timestamp).format('dddd, MM/DD/YYYY');
    }

    public Date(timestamp: number) {
        return moment(timestamp).format('YYYY-MM-DD');
    }

    public DateParse(timestamp: number) {
        return moment(timestamp).format('MM/DD/YYYY');
    }

    public DateGet(date: string): number {
        return parseInt(moment(date, 'YYYY-MM-DD').format('x'), 10);
    }

    public DateUpdateTime(date: number, time: string): number {
        const timeSplit = time.split(':');
        return parseInt(moment(date).startOf('day')
            .add(timeSplit[0], 'hours').add(timeSplit[1], 'minutes').format('x'), 10);
    }

    public getDateTime(timestamp: number) {
        return moment(timestamp).format('HH/mm');
    }

    public addDateTime(time: string, date: any) {
        const timeSplit = time.split('/');
        return moment(date).add(timeSplit[0], 'hours').add(timeSplit[1], 'minutes').format('x');
    }

    public Time(timestamp: number) {
        return moment(timestamp).format('HH:mm');
    }

    public TimeParse(timestamp: number) {
        return moment(timestamp * 1000).format('hh:mm a');
    }

    /**
     * @func dynamic
     * @desc Formates the given timestamp dynamically.
     * @param {number} timestamp
     * @returns {string} Time related to now
     * @memberof TimeUntiles
     */
    public dynamic(timestamp: number | undefined) {
        if (!timestamp) {
            return '';
        }

        const date = moment(timestamp * 1000);
        const current = Date.now();

        const justNow = moment().startOf('minute');
        if (date.isSameOrAfter(justNow)) {
            return 'Just Now';
        }

        const today = moment(current).startOf('day');
        if (date.isSameOrAfter(today)) {
            return date.format('HH:mm');
        }

        const yesterday = moment(current).startOf('day').subtract(1, 'days');
        if (date.isSameOrAfter(yesterday)) {
            return date.format('[Yesterday] HH:mm');
        }

        const thisYear = moment(current).startOf('year');
        if (date.isSameOrAfter(thisYear)) {
            return date.format('MMM DD');
        }

        return date.format('DD[/]MM[/]YYYY');

    }

    public dynamicDate(timestamp: number | undefined) {
        if (!timestamp) {
            return '';
        }

        const date = moment(timestamp * 1000);
        const current = Date.now();

        const today = moment(current).startOf('day');
        if (date.isSameOrAfter(today)) {
            return date.format('[Today]');
        }

        const yesterday = moment(current).startOf('day').subtract(1, 'days');
        if (date.isSameOrAfter(yesterday)) {
            return date.format('[Yesterday]');
        }

        const thisYear = moment(current).startOf('year');
        if (date.isSameOrAfter(thisYear)) {
            return date.format('MMM DD');
        }

        return date.format('DD[/]MM[/]YYYY');

    }

    public isInSameDay(time1?: number, time2?: number): boolean {
        if (!time1 || !time2) {
            return false;
        }
        return moment(time1 * 1000).isSame(moment(time2 * 1000), 'day');
    }
}

export default new TimeUntiles();
