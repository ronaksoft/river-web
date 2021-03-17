/*
    Creation Time: 2018 - Sep - 30
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import moment from 'moment-jalaali';
// @ts-ignore
import fa from "moment/locale/fa";
// @ts-ignore
import en from "moment/locale/en-ca";
import RiverTime from './river_time';
import {C_LOCALSTORAGE} from "../sdk/const";

class TimeService {
    private riverTime: RiverTime;
    private lang: string = localStorage.getItem(C_LOCALSTORAGE.Lang) || 'en';

    constructor() {
        if (this.lang === 'fa') {
            moment.locale('fa', fa);
            moment.loadPersian({
                dialect: 'persian-modern',
                usePersianDigits: true,
            });
        } else {
            moment.locale('en', en);
        }
        this.riverTime = RiverTime.getInstance();
    }

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
        return moment.unix(timestamp).format('hh:mm a');
    }

    public dynamic(timestamp: number | undefined) {
        if (!timestamp) {
            return '';
        }

        const date = moment.unix(timestamp);
        const current = moment.unix(this.riverTime.now());

        const justNow = current.startOf('minute');
        if (date.isSameOrAfter(justNow)) {
            if (this.lang === 'en') {
                return 'Just Now';
            } else {
                return 'همین الان';
            }
        }

        const today = current.startOf('day');
        if (date.isSameOrAfter(today)) {
            return date.format('HH:mm');
        }

        const yesterday = current.startOf('day').subtract(1, 'days');
        if (date.isSameOrAfter(yesterday)) {
            if (this.lang === 'en') {
                return date.format('[Yesterday] HH:mm');
            } else {
                return date.format('[دیروز] HH:mm');
            }
        }

        const thisYear = current.startOf('year');
        if (date.isSameOrAfter(thisYear)) {
            if (this.lang === 'en') {
                return date.format('MMM DD');
            } else {
                return date.format('jDD jMMMM');
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

        const date = moment.unix(timestamp);
        const current = moment.unix(this.riverTime.now());

        const today = current.startOf('day');
        if (date.isSameOrAfter(today)) {
            if (this.lang === 'en') {
                return date.format('[Today]');
            } else {
                return date.format('[امروز]');
            }
        }

        const yesterday = current.startOf('day').subtract(1, 'days');
        if (date.isSameOrAfter(yesterday)) {
            if (this.lang === 'en') {
                return date.format('[Yesterday]');
            } else {
                return date.format('[دیروز]');
            }
        }

        const thisYear = current.startOf('year');
        if (date.isSameOrAfter(thisYear)) {
            if (this.lang === 'en') {
                return date.format('MMM DD');
            } else {
                return date.format('jDD jMMMM');
            }
        }

        if (this.lang === 'en') {
            return date.format('DD[/]MM[/]YYYY');
        } else {
            return date.format('jDD[/]jMM[/]jYYYY');
        }
    }

    public exactTimeAgo(timestamp: number | undefined) {
        if (!timestamp) {
            return '';
        }

        const date = moment.unix(timestamp);
        const current = moment.unix(this.riverTime.now());

        const minute = current.subtract(1, 'minutes');
        if (date.isSameOrAfter(minute)) {
            if (this.lang === 'en') {
                return 'Just now';
            } else {
                return 'به تازگی';
            }
        }

        const today = current.startOf('day');
        if (date.isSameOrAfter(today)) {
            if (this.lang === 'en') {
                return date.format('[Today at] HH:mm');
            } else {
                return date.format('HH:mm [امروز]');
            }
        }

        const yesterday = current.startOf('day').subtract(1, 'days');
        if (date.isSameOrAfter(yesterday)) {
            if (this.lang === 'en') {
                return date.format('[Yesterday at] HH:mm');
            } else {
                return date.format('[دیروز] HH:mm');
            }
        }

        const thisYear = current.startOf('year');
        if (date.isSameOrAfter(thisYear)) {
            if (this.lang === 'en') {
                return date.format('MMM DD');
            } else {
                return date.format('jDD jMMMM');
            }
        }

        if (this.lang === 'en') {
            return date.format('DD[/]MM[/]YYYY');
        } else {
            return date.format('jDD[/]jMM[/]jYYYY');
        }
    }

    public dateWithTime(timestamp: number | undefined) {
        if (!timestamp) {
            return '';
        }

        const date = moment.unix(timestamp);
        const current = moment.unix(this.riverTime.now());

        const today = current.startOf('day');
        if (date.isSameOrAfter(today)) {
            if (this.lang === 'en') {
                return date.format('[Today at], HH:mm');
            } else {
                return date.format('HH:mm، [امروز]');
            }
        }

        const yesterday = current.startOf('day').subtract(1, 'days');
        if (date.isSameOrAfter(yesterday)) {
            if (this.lang === 'en') {
                return date.format('[Yesterday at], HH:mm');
            } else {
                return date.format('[دیروز] ،HH:mm');
            }
        }

        const thisYear = current.startOf('year');
        if (date.isSameOrAfter(thisYear)) {
            if (this.lang === 'en') {
                return date.format('MMM DD, HH:mm');
            } else {
                return date.format('jDD jMMMM، HH:mm');
            }
        }

        if (this.lang === 'en') {
            return date.format('DD[/]MM[/]YYYY, HH:mm');
        } else {
            return date.format('jDD[/]jMM[/]jYYYY، HH:mm');
        }
    }

    public timeAgo(timestamp: number | undefined) {
        if (!timestamp) {
            return '';
        }

        const today = moment.unix(this.riverTime.now()).startOf('day');
        const now = moment.unix(this.riverTime.now());
        const date = moment.unix(timestamp);

        const justNow = now.subtract(15, 'seconds');
        if (date.isSameOrAfter(justNow)) {
            if (this.lang === 'en') {
                return 'Just Now';
            } else {
                return 'همین الان';
            }
        }

        if (date.isSameOrAfter(today)) {
            if (this.lang === 'en') {
                return `${date.from(now, true)} ago`;
            } else {
                return `${date.from(now, true)} پیش `;
            }
        }

        if (date.isSameOrAfter(today)) {
            return date.format('HH:mm');
        }

        const yesterday = now.startOf('day').subtract(7, 'days');
        if (date.isSameOrAfter(yesterday)) {
            if (this.lang === 'en') {
                return `${date.from(now, true)} ago`;
            } else {
                return `${date.from(now, true)} پیش `;
            }
        }

        const week = now.startOf('day').subtract(14, 'days');
        if (date.isSameOrAfter(week)) {
            if (this.lang === 'en') {
                return 'Within a week';
            } else {
                return 'هفته گذشته';
            }
        }

        const month = now.startOf('day').subtract(1, 'months');
        if (date.isSameOrAfter(month)) {
            if (this.lang === 'en') {
                return 'Within a month';
            } else {
                return 'ماه گذشته';
            }
        }

        if (this.lang === 'en') {
            return 'Long time ago';
        } else {
            return 'خیلی وقت پیش';
        }
    }

    public isInSameDay(time1?: number, time2?: number): boolean {
        if (!time1 || !time2) {
            return false;
        }
        const m1 = moment.unix(time1).parseZone();
        const m2 = moment.unix(time2).parseZone();
        return m1.isSame(m2, 'day');
    }

    public duration(from: number, to: number) {
        const diff = to - from;
        const m = moment.unix(diff).utc(false);
        if (diff < 10) {
            if (this.lang === 'en') {
                return m.format('s [seconds]');
            } else {
                return m.format('s [ثانیه]');
            }
        } else if (diff < 60) {
            if (this.lang === 'en') {
                return m.format('ss [seconds]');
            } else {
                return m.format('ss [ثانیه]');
            }
        } else if (diff < 600) {
            return m.format('m:ss');
        } else if (diff < 3600) {
            return m.format('mm:ss');
        } else {
            return m.format('HH:mm:ss');
        }
    }
}

export default new TimeService();
