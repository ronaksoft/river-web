export const C_FILE_ERR_CODE = {
    ALREADY_IN_QUEUE: 0x05,
    MAX_TRY: 0x01,
    NO_TEMP_FILES: 0x02,
    NO_WORKER: 0x04,
    REQUEST_CANCELLED: 0x03,
};

export const C_FILE_ERR_NAME = {
    0x01: 'max retry count exceeded',
    0x02: 'cannot find temp files',
    0x03: 'request cancelled',
    0x04: 'file manager is not started yet',
    0x05: 'operation is already in queue',
};
