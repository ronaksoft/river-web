// import {db} from '../index';

// @ts-ignore
interface IWorker extends Worker {
}

/* eslint-disable */
// @ts-ignore
const ctx: IWorker = self as any;
/* eslint-enable */

ctx.onmessage = (e) => {
    console.log(e);
};

