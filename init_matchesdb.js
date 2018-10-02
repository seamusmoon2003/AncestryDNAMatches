// Create and initialize the matches Database
var Database = require('better-sqlite3');
var db = new Database('matches.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the matches database.');
  });

  // create the matches table
  const sqlInit = `
  CREATE TABLE matches (
      id   TEXT PRIMARY KEY,
      name TEXT,
      range TEXT,
      estimate TEXT,
      confidence TEXT,
      link TEXT
  );
  `;
db.exec(sqlInit);


  /* example code
  const Database = require('better-sqlite3');

// connect to database (will create if it doesn't exist
let db = new Database("whatever.xxx");

// check to see if we already initialized this database
let stmt = db.prepare(`SELECT name
    FROM sqlite_master
    WHERE
        type='table' and name='person'
    ;`);
let row = stmt.get();
if(row === undefined){
    console.log("WARNING: database appears empty; initializing it.");
    const sqlInit = `
        CREATE TABLE person (
            id   INTEGER PRIMARY KEY,
            name TEXT
        );

        INSERT INTO person (name) VALUES
            ("My name!" ),
            ("Your name!" )
        ;

        CREATE TABLE PhoneNumber (
            phone    TEXT,
            name_id     INTEGER,
            FOREIGN KEY (name_id) REFERENCES person(id)
        );
        `;
    db.exec(sqlInit);
}

console.log("database exists now, if it didn't already.");
*/