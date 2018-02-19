// Nightmare implementation
var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: true });
var url = 'https://www.ancestry.com/dna/';      // The Ancestry website
var i = 1;
 // Username & password from the command line
 var ANCESTRY_USERNAME = 'seamusmoon2003@gmail.com'; 
 var ANCESTRY_PASSWORD = '1anjak3';
 
nightmare
.goto( url )
// The code below works to click the sign in
.evaluate(() => document.getElementById("navAccount").click() )
.type('input[name=username]', ANCESTRY_USERNAME)
.type('input[name=password]', ANCESTRY_PASSWORD)
.click("form [type=submit]")
// end of working sign in code
// this part appears to work too
// gets to the matches page
.wait(5000)
.click('.insightsMatchesCta')
.wait(5000)
.evaluate( function() {
    var aMatchTestIDs = document.querySelector('.matchesName');
    console.log( aMatchTestIDs);
    
})
 .end()
 .catch( function (error) {
 	console.error('Something dint work', error);
 });
 
/*
 
function processPage() {
    // casper.waitForText('AncestryDNA Results for', function() {
    // Wait 1 more second
    casper.wait(1000);
    // casper.echo('Make a screenshot of the matches page');
    // casper.echo(casper.getTitle());
    //this.capture('matches_page.png');
    // Pick all the shared match data from this page
    // Let's go with match test ID, name, admin, confidence, predicted relationship for now
    // casper.echo('Outputting some stuff....');
    // require('utils').dump(casper.getElementInfo('.textxlrg'));           // Gets the confidence level
    i++;
    casper.echo('Matches Page: ' + i);
    getAncestryMatches();

    // click the next button
    // casper.echo('Trying to click the next button');
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

 

// Everything below this line is processing data
casper.then( processPage );
casper.run();

var stopScript = function() {
    casper.echo("STOPPING SCRIPT").exit();
};
*/
function getAncestryMatches() {
    // loop stuff
    
    var aMatchTestIDs = document.querySelectorAll('.textxlrg'); // , 'href');
    /*
    var aMatchNames = myRef.getElementsInfo('.textxlrg');
    var aAdmins = myRef.getElementsInfo('.matchesAdmin');
    var aRanges = myRef.getElementsInfo(".noTopSpacing em");
    var aConfidences = myRef.getElementsAttribute('.dnaInlineBlock', 'style');
    */
    for (var i = 0; i < aMatchTestIDs.length; i++) {
        /*
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
        */
       console.log( aMatchTestIDs[i] );
    }
};

