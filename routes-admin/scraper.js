var requestJson = require('request-json')
, ErrorConsts = require('../lib/store/ErrorConsts.js')
;

module.exports = function( app, express ) {
  app.get( '/scraper/link/content', (req, res)=> {http://www.buzzfeed.com/andrewkaczynski/gop-oppo-firm-gearing-up-for-a-possible-sanders-nomination#.poMRR0VrP
    if( !req.query.url ) {
      return res.fail(ErrorConsts.MissingParameters, "Missing URL Parameter");
    }
    var url = encodeURIComponent(req.query.url);
    var jsonClient = requestJson.createClient('http://api.diffbot.com');
    jsonClient.get('/v3/analyze?token=ef1779cba0eb6e6af75bfce5e4f94c45&url='+url, (err, getResponse, getResponseBody)=>{
      console.log(getResponseBody);
      if( err ) {
        return res.fail( err );
      }
      if( getResponseBody.objects && getResponseBody.objects.length ) {
        var scrapeContent = getResponseBody.objects[0];
        res.success(scrapeContent);
      } else {
        res.fail("Failed to scrape link.");
      }

    });

  });
}
