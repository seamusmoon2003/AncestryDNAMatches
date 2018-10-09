// Use Puppeteer to scrape Ancestry
// All the stuff not commented out works.
// This all works really well, too.
// Database stuff works now!
// Might wish to coonsider checking if the database exists here, and then
// initializing it if is doesn't.
// Here is how to iterate over a return set:
/*
var stmt = db.prepare('SELECT * FROM entries');
for (var row of stmt.iterate()) {
  if (row.foo === desiredData) {
    console.log('found it!');
    break;
  }
}
*/

const Database = require('better-sqlite3');
const DB_PATH = 'matches.db';


// Command Line Args Declarations
const commandLineArgs = require('command-line-args');
const optionDefinitions = [
  { name: 'username', alias: 'u', type: String },
  { name: 'password', alias: 'p', type: String }
];
const options = commandLineArgs(optionDefinitions);
const usageStr = 'usage: node scrape_icw.js --username <myname> --password <mypwd>';

// If the command line looks like this:
// example --username=Fred --password=derF
// then options looks like this:
/*
{
  username: 'Fred',
  password: 'derF'
}
*/

if (typeof options.username == 'undefined') {
  console.log( usageStr );
  process.exit(-1);
}

if (typeof options.password == 'undefined') {
  console.log( usageStr );
  process.exit(-1);
}

const puppeteer = require('puppeteer');
const util = require('util');
const myPicName = 'puppet.png';			// path name for the screenshot png

// It works passing as a parameter
let scrape = async (matchPage, page) => {
  // To Do: Need to come up with a strategy to get this URL on first login and save it
  // And to use cookies, so we don;t have to keep logging in everytime.
  // This is OK for now.

  
  await page.goto(matchPage);           // go to the match page
  await page.waitFor(2000);       // wait for a little bit
  // Now click the matches button and go to the icw page
  await page.evaluate(() => {
    let matchButton = 'body > div.ancSiteWrp > div.mainContent > div > article > div > section.con > section > div.textCenter > div > button';
    return document.querySelector(matchButton).click();
  });

  await page.waitFor(2000);
  // Now on the icw page
  // Do the scraping
  // From looking at the website, it would appear, I can use virtually the same code for the ICW scrape.
  // That's cool.
  // Now need to modularize it.
  const result = await page.evaluate(() => {
    let data = [];    // Empty array for the match data
    let elements = document.querySelectorAll('.textxlrg');  // Get the name and matchID
    
    // Loop through each element
    // Hack: Starting at 2 because the first two elements are some kind of notes
    for (var i = 2; i < elements.length; i++) { 
      let name = elements[i].innerText;
      // Get the link to the individual page
      let link = elements[i].getAttribute('href');
      // Extract the matchID from the link
      let matchID = link;
      matchID = matchID.split("?");
      matchID = matchID[0].split("/");
      matchID = matchID[3];
      // Create the match ine item string for output
      let matchDataLine = name + ',' + matchID;
      // Push the line item to the output array
      data.push( matchDataLine );
    }
    return data;
    
  });
  return result;
};

// to do the looping
// This works.
(async () => {
  // Initialize the DB
  const db = new Database(DB_PATH);

  // Initialize the puppeteer browser and page
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  // Do the login first
  await page.goto('https://www.ancestry.com/dna/matches/5354AC1A-607E-4507-A3DC-BCA4D2142FD0?filterBy=ALL&sortBy=RELATIONSHIP&page=1');
  await page.waitFor(1000);

  // Now log in
  // Need to come up with a strategy to save usernames and passwords in a file
  // and then read protect it.
  await page.type('#username', options.username);
  await page.type('#password', options.password);
  await page.click('#loginButton');
  await page.waitFor(5000);         // Wait a long time to get redirected

  // Now go and get all the data
  /* 
    Loop logic using the database
    let matchIDs = results from database. Get the matchID, name, and match page url for the match
    for (matchID in matchIDs)
    do the scrape, passing the match page url to the scrape function (from the datbase)
    */
   /*
   This is how to iterate
   const stmt = db.prepare('SELECT * FROM cats');

   for (const cat of stmt.iterate()) {
     if (cat.name === 'Joey') {
       console.log('found him!');
       break;
     }
   }
 */ 
  // this will get me from startPage to endPage inclusive.
  // Pages start counting at page 1 (rather than 0).
  //for(let i = startPage; i <= endPage; i++){
    
    // This is a test match page.
  // For now it is kenforsythe's page
  // In the future, we will get the page url from the database
  const stmt = db.prepare('SELECT * FROM matches');
  var matchPage;
  for (const match of stmt.iterate()) {
    matchPage = 'https://www.ancestry.com/dna/' + match.link;
  }
    await scrape(matchPage, page).then((value) => {
       /* DATABASE
      // Iterate over the array and put insert the data into the database
      value.forEach(function(aline) {
        // each line is a comma delimted list like this:
        //  matchID,name,range,estimatedRelationship,confidence, link
        fields = aline.split(",");
       
        // Database
        // Insert the data - or replace the line if it is a dup.
        // The query is something like this
        // INSERT INTO icw VALUES (?,?,?,?) matchID, matchName, icwID, icwName
        let stmt = db.prepare('INSERT OR REPLACE INTO matches VALUES (?,?,?,?,?,?)');
        stmt.run( fields[0], fields[1], fields[2], fields[3], fields[4], fields[5]);
      });
      */
      // Print the array output
      console.log(util.inspect(value, { maxArrayLength: null}));      // Success
    });
  //}
  /*  DATABASE
  db.close();                     // Close the db
  */
  //await browser.close();          // Buh bye
})();