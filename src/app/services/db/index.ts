import Dexie from "dexie";

export const dbHealthCheck = (db: Dexie) => {
    let restarting = false;
    const restartDb = () => {
        if (restarting) {
            return;
        }
        restarting = true;
        try {
            db.close();
        } catch (e) {
            //
        }
        db.open().then(() => {
            restarting = false;
        });
    };
    db.on.blocked.subscribe(() => {
        restartDb();
    });
    db.on.close.subscribe(() => {
        restartDb();
    });
};