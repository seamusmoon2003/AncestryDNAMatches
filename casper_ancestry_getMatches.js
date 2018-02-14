// I got the recursion to work!
// 'cept it crashes after a while.

var url = 'https://www.ancestry.com/dna/';      // The Ancestry website
var i = 1;
function processPage() {
    // casper.waitForText('AncestryDNA Results for', function() {
    // Wait 1 more second
    casper.wait(1000);
    casper.echo('Make a screenshot of the matches page');
    casper.echo(casper.getTitle());
    //this.capture('matches_page.png');
    // Pick all the shared match data from this page
    // Let's go with match test ID, name, admin, confidence, predicted relationship for now
    // casper.echo('Outputting some stuff....');
    // require('utils').dump(casper.getElementInfo('.textxlrg'));           // Gets the confidence level
    i++;
    casper.echo('Matches Page: ' + i);
    getAncestryMatches();

    // click the next button
    casper.echo('Trying to click the next button');
    // copied big long selector from instpect element
    // this.click('body > div.ancSiteWrp > div.mainContent > div:nth-child(3) > article > div > div.page.pagePadded.pageWidth1.topSpacing > div > section.matchesFilter.clearfix > div.matchesPagination.matchesPaginationTop > div > a.ancBtn.silver.ancBtnIconOnly.ancBtnR.icon.iconArrowRight');
    // Trying it with an evaluate - IT WORKS!!!!!!!
    casper.evaluate(function() {
        document.querySelector('a.ancBtn.silver.ancBtnIconOnly.ancBtnR.icon.iconArrowRight').click();
    });

    if ( (casper.fetchText('h3') == 'No matches found' ) ) {
        casper.then(stopScript);
    } else {
        casper.then(processPage);
    }
    // });
};

var casper = require('casper').create({
    viewportSize: {
        width: 1600,
        height: 1000
    },
    pageSettings: {
        // loadImages: false,
        // loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'
    },
 });

  // Username & password from the command line
 var ANCESTRY_USERNAME = casper.cli.get('username');
 var ANCESTRY_PASSWORD = casper.cli.get('password');
 
 if (!casper.cli.has('username') && !casper.cli.has('password')) {
    casper.echo ('Usage $ phantom.exe casperjs.js casper_ancestry_login.js --username=USERNAME --password=PASSWORD').exit(-1);
}

// *************
// first step is to open Ancestry
casper.start().thenOpen(url, function() {
    console.log("Ancestry website opened");
    console.log("Saving screenshot as BeforeLogin.png");
    // this.capture("BeforeLogin.png");
    // Dump the page content
    //console.log(this.getPageContent());
    // This part clicks the button to go to the login form screen.
    this.evaluate(function() {
        document.getElementById("navAccount").click();
    });
});

// Try logging in with the form
casper.then( function() {
    console.log("Login using username and password");
    // console.log(this.getPageContent());
    // this.capture("LoginForm.png");
    this.fill('form#signInForm', {
       username: ANCESTRY_USERNAME,
       password: ANCESTRY_PASSWORD
    }, true);
});

// Wait to be redirected to the home page, then take a screenshot
// Wait for the selector (the login form, in this case) to go away
// I think this was the key to getting it to work....
casper.waitWhileSelector('form#signInForm', function loginWait() {
    this.echo('Selector form is gone, going to main DNA page');
}, function formWaitFailure() { 
    this.echo('Failed waiting for form. Exiting'); casper.exit();
}, 5000);

// Wait until the class for the clicky link shows up.
// Click the button and go to the Matches page.
casper.waitForSelector('.insightsMatchesCta', function() {
    // Wait a bit longer for everything to load...
    this.wait(1000);
    this.echo(this.getTitle());
    console.log("Make a screenshot and save it as AfterLogin.png");
    // this.capture("AfterLogin.png");
    this.echo('Going to matches page');
    this.echo('Trying to click insightsMatchesCta');
    // Click on the class (which is a button, I guess) to go to the matches page.
    this.click('.insightsMatchesCta');
});
// Everything above this line is about getting logged in and to the matches page

// Everything below this line is processing data
casper.then( processPage );
casper.run();

var stopScript = function() {
    casper.echo("STOPPING SCRIPT").exit();
};

function getAncestryMatches() {
    // loop stuff
    myRef = casper;
    myRef.echo('Starting getAncestryMatches function');
    var aMatchTestIDs = myRef.getElementsAttribute('.textxlrg', 'href');
    var aMatchNames = myRef.getElementsInfo('.textxlrg');
    var aAdmins = myRef.getElementsInfo('.matchesAdmin');
    var aRanges = myRef.getElementsInfo(".noTopSpacing em");
    var aConfidences = myRef.getElementsAttribute('.dnaInlineBlock', 'style');
    for (var i = 0; i < aMatchTestIDs.length; i++) {
        // Gets the match test ID
        var dummy = aMatchTestIDs[i].split("?");
        dummy = dummy[0].split("/");
        var lMatchTestID = dummy[3];
        // Gets the matchname
        lMatchName = aMatchNames[i];
        // Get the admin
        // var lAdmin = aAdmins[i];
        // get the range
        var lRange = aRanges[i];
        // Get the confidence level
        dummy = aConfidences[i].split(" ");
        var lConfidence = dummy[1].substring(0, dummy[1].length-1);        // clip off the ;
        // this.echo('MatchTestID= ' + lMatchTestID + ', Match : ' + lMatchName.text + ', ' + lAdmin.text + ', ' + lConfidence + ' Confidence level, ' + lRange.text );
        myRef.echo('MatchTestID= ' + lMatchTestID + ', Match : ' + lMatchName.text + ', ' + lConfidence + ' Confidence level, ' + lRange.text );
    }
};

