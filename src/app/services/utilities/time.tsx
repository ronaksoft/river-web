/*
    Creation Time: 2018 - Sep - 30
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as moment from 'moment-jalaali';
// @ts-ignore
import fa from "moment/locale/fa";
import RiverTime from './river_time';

/**
 * @class TimeUntiles
 * @desc Formats a timestamp (usually provided by Cyrus) in full and dynamic formats
 */
class TimeUntiles {
    private riverTime: RiverTime;
    private lang: string = localStorage.getItem('river.lang') || 'en';

    constructor() {
        this.riverTime = RiverTime.getInstance();
        if (this.lang === 'fa') {
            moment.locale("fa", fa);
            moment.loadPersian();
        }
    }

    /**
     * @func full
     * @desc Formats the given timestamp in full mode
     * @param {number} timestamp
     * @returns {string}
     * @memberof TimeUntiles
     */
    public full(timestamp: number) {
        if (this.lang === 'en') {
            return moment(timestamp).format('dddd, MMMM DD YYYY, HH:mm');
        } else {
            return moment(timestamp).format('jdddd, jMMMM jDD jYYYY, HH:mm');
        }
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
        const current = this.riverTime.milliNow();

        const justNow = moment().startOf('minute');
        if (date.isSameOrAfter(justNow)) {
            if (this.lang === 'en') {
                return 'Just Now';
            } else {
                return 'همین الان';
            }
        }

        const today = moment(current).startOf('day');
        if (date.isSameOrAfter(today)) {
            return date.format('HH:mm');
        }

        const yesterday = moment(current).startOf('day').subtract(1, 'days');
        if (date.isSameOrAfter(yesterday)) {
            if (this.lang === 'en') {
                return date.format('[Yesterday] HH:mm');
            } else {
                return date.format('[دیروز] HH:mm');
            }
        }

        const thisYear = moment(current).startOf('year');
        if (date.isSameOrAfter(thisYear)) {
            if (this.lang === 'en') {
                return date.format('MMM DD');
            } else {
                return date.format('jMMMM jDD');
            }
        }

        if (this.lang === 'en') {
            return date.format('DD[/]MM[/]YYYY');
        } else {
            return date.format('jDD[/]jMM[/]jYYYY');
        }
    }

    public dynamicDate(timestamp: number | undefined) {
        if (!timestamp) {
            return '';
        }

        const date = moment(timestamp * 1000);
        const current = this.riverTime.milliNow();

        const today = moment(current).startOf('day');
        if (date.isSameOrAfter(today)) {
            if (this.lang === 'en') {
                return date.format('[Today]');
            } else {
                return date.format('[امروز]');
            }
        }

        const yesterday = moment(current).startOf('day').subtract(1, 'days');
        if (date.isSameOrAfter(yesterday)) {
            if (this.lang === 'en') {
                return date.format('[Yesterday]');
            } else {
                return date.format('[دیروز]');
            }
        }

        const thisYear = moment(current).startOf('year');
        if (date.isSameOrAfter(thisYear)) {
            if (this.lang === 'en') {
                return date.format('MMM DD');
            } else {
                return date.format('jMMM jDD');
            }
        }

        if (this.lang === 'en') {
            return date.format('DD[/]MM[/]YYYY');
        } else {
            return date.format('jDD[/]jMM[/]jYYYY');
        }
    }

    public timeAgo(timestamp: number | undefined) {
        if (!timestamp) {
            return '';
        }

        const current = this.riverTime.milliNow();
        const today = moment(current).startOf('day');
        const date = moment(timestamp * 1000);

        if (date.isSameOrAfter(today)) {
            if (this.lang === 'en') {
                return `${date.from(current, true)} ago`;
            } else {
                return `${date.from(current, true)} پیش `;
            }
        }

        if (date.isSameOrAfter(today)) {
            return date.format('HH:mm');
        }

        const yesterday = moment(current).startOf('day').subtract(1, 'days');
        if (date.isSameOrAfter(yesterday)) {
            if (this.lang === 'en') {
                return date.format('[Yesterday] HH:mm');
            } else {
                return date.format('[دیروز] HH:mm');
            }
        }

        const thisYear = moment(current).startOf('year');
        if (date.isSameOrAfter(thisYear)) {
            if (this.lang === 'en') {
                return date.format('MMM DD');
            } else {
                return date.format('jMMM jDD');
            }
        }

        if (this.lang === 'en') {
            return date.format('DD[/]MM[/]YYYY');
        } else {
            return date.format('jDD[/]jMM[/]jYYYY');
        }
    }

    public isInSameDay(time1?: number, time2?: number): boolean {
        if (!time1 || !time2) {
            return false;
        }
        const m1 = moment.parseZone(time1 * 1000);
        const m2 = moment.parseZone(time2 * 1000);
        return m1.isSame(m2, 'day');
    }
}

export default new TimeUntiles();
