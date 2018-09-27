const sqlite3 = require('better-sqlite3').verbose();
const DB_PATH = 'matches.db';

/**
 * open a new SQLLite DB connection (with read and write access).
 * @return {Promise<any>} promise with the opened connection db.
 */
const openConnection= ()=>new Promise((resolve, reject) => {
    let db = new sqlite3.Database(DB_PATH, err => {
        if (err) return reject(err.message);
    });

    resolve(db);
});

/**
 * close the given SQLLite DB connection.
 * @param db - the db-connection to close.
 * @return {Promise<any>}
 */
const closeConnection= db=>new Promise((resolve, reject) => {
    db.close(err=>{
        if (err) return reject(err.message);
    });

    resolve();
});

module.exports = {
    /**
     *  insert a new row with the given stats to the "measures table.
     * @param stats - the row to insert. It is a hash with {col: value, col: value.....}
     * @return {Promise<any>} promise with thw stats and the new generated id.
     */
    insertData: row => new Promise(async (resolve, reject) => {
        let db = await openConnection();
        const cols = Object.keys(stats); // get all keys for mapping to columns.

        db.run(`INSERT INTO matches (${cols.join(`,`)}) VALUES (${cols.map(() => `?`).join(`,`)})`, Object.values(stats), function (err) {
            if (err)
                return reject(err.message);

            resolve(Object.assign(stats, {id: this.lastID})); // merge stats with the new generated ID.
        });

        await closeConnection(db);
    })
};