// Use Puppeteer to scrape Ancestry
// for passing the username & password:
// Provide your username and password as environment variables when running the script, i.e:
// `GITHUB_USER=myuser GITHUB_PWD=mypassword node scrape.js`

const puppeteer = require('puppeteer');
const myPicName = 'puppet.png';			// path name for the screenshot png

let scrape = async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  const result = 'OK';
  await page.goto('https://dna.ancestry.com');
  await page.waitFor(1000);
  // This is the stupid splash screen I have to click through
  await page.click('#navAccount');                              // click on the sign in button
  await page.click('#navAccount');  
  await page.waitFor(1000);
  var title = await page.title();
  console.log(title);
  await page.screenshot({path: myPicName});

  // Now log in
  await page.type('#username', process.env.GITHUB_USER);
  await page.type('#password', process.env.GITHUB_PWD);
  await page.click('#loginButton');
  await page.waitForNavigation();
  title = await page.title();
  console.log(title);
  await page.screenshot({path: myPicName});

  // Logged in to main DNA screen - go to matches page
  // A bit of a long selector, but it works.....
  await page.click('body > div.ancSiteWrp > div.mainContent > div:nth-child(3) > article > div.dnaInsightsPage > div:nth-child(1) > div.mainGrid > div > div:nth-child(2) > div.insightsMatchesCtaWrapper > a');
  await page.waitForNavigation();
  title = await page.title();
  console.log(title);
  await page.screenshot({path: myPicName});

  // Now on the matches page
  

  // Scrape
  browser.close();
  return result;
};

scrape().then((value) => {
    console.log(value); // Success!
});
