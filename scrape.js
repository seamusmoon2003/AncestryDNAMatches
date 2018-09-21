// Use Puppeteer to scrape Ancestry
// for passing the username & password:
// Provide your username and password as environment variables when running the script, i.e:
// `GITHUB_USER=myuser GITHUB_PWD=mypassword node scrape.js`
// All the stuff not commented out works.
// This all works really well, too.

// Command Line Args Declarations
const commandLineArgs = require('command-line-args');
const optionDefinitions = [
  { name: 'username', alias: 'u', type: String },
  { name: 'password', alias: 'p', type: String },
  { name: 'startPage', alias: 's', type: Number, },
  { name: 'endPage', alias: 'e', type: Number}
];
const options = commandLineArgs(optionDefinitions);
// If the command line looks like this:
// example --username=Fred --password=derF --startPage 1 --endPage 425
// then options looks like this:
/*
{
  username: 'Fred',
  password: 'derF',
  startPage: 1
  endPage: 425
}
*/


const puppeteer = require('puppeteer');
const util = require('util');
const myPicName = 'puppet.png';			// path name for the screenshot png
// this is awful, because it re-logs in every cycle of the loop!
// Need to fix.
// It works passing as a parameter
let scrape = async (idx, page) => {
  /*
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  */
  // Need to come up with a strategy to get this URL on first login and save it
  // And to use cookies, so we don;t have to keep logging in everytime.
  // This is OK for now.
  // shift the idx to be the counting numbers, since page starts at 1
  let url = 'https://www.ancestry.com/dna/matches/5354AC1A-607E-4507-A3DC-BCA4D2142FD0?filterBy=ALL&sortBy=RELATIONSHIP&page=';
  url = url + idx;                // Add the page
  await page.goto(url);           // go to the next page
  await page.waitFor(2000);       // wait for a little bit

  // Now on the next matches page
  // Do the scraping
  const result = await page.evaluate(() => {
    let data = [];    // Empty array for the match data
    let elements = document.querySelectorAll('.textxlrg');  // Get the name and matchID
    console.log('Num elements: ' + elements.length);
    let ranges = document.querySelectorAll('.noTopSpacing em');
    let confidences = document.querySelectorAll('.dnaInlineBlock');
    // This is to get admins:
    //    let aAdmins = document.querySelectorAll('.matchesAdmin');
    //    the field should be innerText. The text is tagged with strong.
    //    Not every element has one of these.
    
    // Loop through each element
    // The proper working of this loop depends on the number of elements for '.textxlrg'
    // matching the number of everything else. If something is missing from
    // one of the other data items, then this won't work right.
    // To Do: make the element matching to the other fields that are not in an element
    // more robust. Maybe with child nodes or something like that.
    // To Do: Figure out how to get the admin and match it with the correct element. Again,
    // maybe with child nodes or something.
    for (var i = 0; i < elements.length; i++) { 
      let confidence = confidences[i].getAttribute('style');
      // get rid of the "width: " in the confidence level
      confidence = confidence.split(" ");
      confidence = confidence[1];
      // Get the range and suggested relationship
      let range = ranges[2*i].innerText; 
      let estimatedRelationship = ranges[2*i + 1].innerText;
      let name = elements[i].innerText;
      // Extract the matchID from the href
      let matchID = elements[i].getAttribute('href');
      matchID = matchID.split("?");
      matchID = matchID[0].split("/");
      matchID = matchID[3];

      // Create the match ine item string for output
      let matchDataLine = name + ', ' + matchID + ', ' + range + ', ' + estimatedRelationship + ', ' + confidence;
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
  // Initialize the puppeteer browser and pag
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();

  // Do the login first
  await page.goto('https://www.ancestry.com/dna/matches/5354AC1A-607E-4507-A3DC-BCA4D2142FD0?filterBy=ALL&sortBy=RELATIONSHIP&page=1');
  await page.waitFor(1000);

  // Now log in
  // Need to come up with a strategy to save usernames and passwords in a file
  // and then read protect it.
  await page.type('#username', process.env.GITHUB_USER);
  await page.type('#password', process.env.GITHUB_PWD);
  await page.click('#loginButton');
  await page.waitFor(5000);         // Wait a long time to get redirected

  // Now go and get all the data
  // This will give a start and end page to scrape through
  const startPage = 10;
  const endPage = 20;
  // this will get me from startPage to endPage inclusive.
  // Pages start counting at page 1 (rather than 0).
  for(let i = startPage; i <= endPage; i++){
    // Do the scraping - this advances the page too
    await scrape(i, page).then((value) => {
      // this is for marking the page numbers in the output
      console.log( 'Page ' + i );
      // Print the array output
      console.log(util.inspect(value, { maxArrayLength: null}));      // Success
    });
  }
  await browser.close();          // Buh bye
})();
