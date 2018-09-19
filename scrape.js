// Use Puppeteer to scrape Ancestry
// for passing the username & password:
// Provide your username and password as environment variables when running the script, i.e:
// `GITHUB_USER=myuser GITHUB_PWD=mypassword node scrape.js`
// All the stuff not commented out works.

const puppeteer = require('puppeteer');
const util = require('util');
const myPicName = 'puppet.png';			// path name for the screenshot png

// this is awful, because it re-logs in every cycle of the loop!
// Need to fix.
let scrape = async (idx) => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  // Need to come up with a strategy to get this URL on first login and save it
  // And to use cookies, so we don;t have to keep logging in everytime.
  // This is OK for now.
  // shift the idx to be the counting numbers, since page starts at 1
  idx = idx + 1;
  let url = 'https://www.ancestry.com/dna/matches/5354AC1A-607E-4507-A3DC-BCA4D2142FD0?filterBy=ALL&sortBy=RELATIONSHIP&page=';
  url = url + idx;                // Add the page
  await page.goto(url);

  await page.waitFor(1000);

  // Now log in
  // Need to come up with a strategy to save usernames and passwords in a file
  // and then read protect it.
  await page.type('#username', process.env.GITHUB_USER);
  await page.type('#password', process.env.GITHUB_PWD);
  await page.click('#loginButton');
  // Wait a while...
  await page.waitFor(5000);
 
  // Now on the matches page
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
  
  // await page.waitFor(1000);
  await browser.close();
  return result;
};

// to do the looping
// This works.
(async () => {
  for(let i = 0; i < 10; i++){
    await scrape(i).then((value) => {
      // this is for marking the page numbers in the output
      let page = i+1;
      console.log( 'Page ' + page );
      // Print the array output
      console.log(util.inspect(value, { maxArrayLength: null}));      // Success
    });
  }
})();
