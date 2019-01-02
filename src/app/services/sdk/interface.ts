/*
    Creation Time: 2018 - Sep - 26
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

export interface IConnInfo {
    /**
     * @prop AuthID
     * @desc AuthId of connection
     * @type {number}
     * @memberof IConnInfo
     */
    AuthID: string;
    /**
     * @prop AuthKey
     * @desc AuthKey of connection
     * @type {number}
     * @memberof IConnInfo
     */
    AuthKey: string;
    /**
     * @prop FirstName
     * @desc Current connection's FirstName
     * @type {string}
     * @memberof IConnInfo
     */
    FirstName?: string;
    /**
     * @prop LastName
     * @desc Current connection's LastName
     * @type {string}
     * @memberof IConnInfo
     */
    LastName?: string;
    /**
     * @prop Phone
     * @desc Current connection's Phone
     * @type {string}
     * @memberof IConnInfo
     */
    Phone?: string;
    /**
     * @prop UserID
     * @desc Current connection's UserID
     * @type {string}
     * @memberof IConnInfo
     */
    UserID?: string;
    /**
     * @prop Username
     * @desc Current connection's Username
     * @type {string}
     * @memberof IConnInfo
     */
    Username?: string;
}
