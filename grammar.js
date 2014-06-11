'use strict';
var mongoose = require('mongoose');
var gramophone = require('gramophone');
var _ = require('lodash');
var db = mongoose.connection;
var fs = require('fs');
var ProgressBar = require('progress');
var Q = require('q');

mongoose.connect('mongodb://localhost/fwordbot');
var Fuck = require('./lib/schemas/Fuck');
var SingleFuck = require('./lib/schemas/SingleFuck');
var Author = require('./lib/schemas/Author');
var Comment = require('./lib/schemas/Comment');

var singleFuckPattern = new RegExp(/^fuck[a-z]*$/i);
var fuckPattern = new RegExp(/fuck/);
var startWords = ['a', 'apos', 'a’s', 'able', 'about', 'above', 'according', 'accordingly', 'across', 'actually', 'after', 'afterwards', 'again', 'against', 'ain’t', 'all', 'allow', 'allows', 'almost', 'alone', 'along', 'already', 'also', 'although', 'always', 'am', 'among', 'amongst', 'an', 'and', 'another', 'any', 'anybody', 'anyhow', 'anyone', 'anything', 'anyway', 'anyways', 'anywhere', 'apart', 'appear', 'appreciate', 'appropriate', 'are', 'aren’t', 'around', 'as', 'aside', 'ask', 'asking', 'associated', 'at', 'available', 'away', 'awfully', 'be', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'behind', 'being', 'believe', 'below', 'beside', 'besides', 'best', 'better', 'between', 'beyond', 'both', 'brief', 'but', 'by', 'c’mon', 'c’s', 'came', 'can', 'can’t', 'cannot', 'cant', 'cause', 'causes', 'certain', 'certainly', 'changes', 'clearly', 'co', 'com', 'come', 'comes', 'concerning', 'consequently', 'consider', 'considering', 'contain', 'containing', 'contains', 'corresponding', 'could', 'couldn’t', 'course', 'currently', 'definitely', 'described', 'despite', 'did', 'didn’t', 'different', 'do', 'does', 'doesn’t', 'doing', 'don’t', 'done', 'down', 'downwards', 'during', 'each', 'edu', 'eg', 'eight', 'either', 'else', 'elsewhere', 'enough', 'entirely', 'especially', 'et', 'etc', 'even', 'ever', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'ex', 'exactly', 'example', 'except', 'far', 'few', 'fifth', 'first', 'five', 'followed', 'following', 'follows', 'for', 'former', 'formerly', 'forth', 'four', 'from', 'further', 'furthermore', 'get', 'gets', 'getting', 'given', 'gives', 'go', 'goes', 'going', 'gone', 'got', 'gotten', 'greetings', 'had', 'hadn’t', 'happens', 'hardly', 'has', 'hasn’t', 'have', 'haven’t', 'having', 'he', 'he’s', 'hello', 'help', 'hence', 'her', 'here', 'here’s', 'hereafter', 'hereby', 'herein', 'hereupon', 'hers', 'herself', 'hi', 'him', 'himself', 'his', 'hither', 'hopefully', 'how', 'howbeit', 'however', 'i', 'I', 'i’d', 'i’ll', 'i’m', 'i’ve', 'ie', 'if', 'ignored', 'immediate', 'in', 'inasmuch', 'inc', 'indeed', 'indicate', 'indicated', 'indicates', 'inner', 'insofar', 'instead', 'into', 'inward', 'is', 'isn’t', 'it', 'it’d', 'it’ll', 'it’s', 'its', 'itself', 'just', 'keep', 'keeps', 'kept', 'know', 'knows', 'known', 'last', 'lately', 'later', 'latter', 'latterly', 'least', 'less', 'lest', 'let', 'let’s', 'like', 'liked', 'likely', 'little', 'look', 'looking', 'looks', 'ltd', 'mainly', 'many', 'may', 'maybe', 'me', 'mean', 'meanwhile', 'merely', 'might', 'more', 'moreover', 'most', 'mostly', 'much', 'must', 'my', 'myself', 'name', 'namely', 'nd', 'near', 'nearly', 'necessary', 'need', 'needs', 'neither', 'never', 'nevertheless', 'new', 'next', 'nine', 'no', 'nobody', 'non', 'none', 'noone', 'nor', 'normally', 'not', 'nothing', 'novel', 'now', 'nowhere', 'obviously', 'of', 'off', 'often', 'oh', 'ok', 'okay', 'old', 'on', 'once', 'one', 'ones', 'only', 'onto', 'or', 'other', 'others', 'otherwise', 'ought', 'our', 'ours', 'ourselves', 'out', 'outside', 'over', 'overall', 'own', 'particular', 'particularly', 'per', 'perhaps', 'placed', 'please', 'plus', 'possible', 'presumably', 'probably', 'provides', 'que', 'quite', 'qv', 'rather', 'rd', 're', 'really', 'reasonably', 'regarding', 'regardless', 'regards', 'relatively', 'respectively', 'right', 'said', 'same', 'saw', 'say', 'saying', 'says', 'second', 'secondly', 'see', 'seeing', 'seem', 'seemed', 'seeming', 'seems', 'seen', 'self', 'selves', 'sensible', 'sent', 'serious', 'seriously', 'seven', 'several', 'shall', 'she', 'should', 'shouldn’t', 'since', 'six', 'so', 'some', 'somebody', 'somehow', 'someone', 'something', 'sometime', 'sometimes', 'somewhat', 'somewhere', 'soon', 'sorry', 'specified', 'specify', 'specifying', 'still', 'sub', 'such', 'sup', 'sure', 't’s', 'take', 'taken', 'tell', 'tends', 'th', 'than', 'thank', 'thanks', 'thanx', 'that', 'that’s', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'thence', 'there', 'there’s', 'thereafter', 'thereby', 'therefore', 'therein', 'theres', 'thereupon', 'these', 'they', 'they’d', 'they’ll', 'they’re', 'they’ve', 'think', 'third', 'this', 'thorough', 'thoroughly', 'those', 'though', 'three', 'through', 'throughout', 'thru', 'thus', 'to', 'together', 'too', 'took', 'toward', 'towards', 'tried', 'tries', 'truly', 'try', 'trying', 'twice', 'two', 'un', 'under', 'unfortunately', 'unless', 'unlikely', 'until', 'unto', 'up', 'upon', 'us', 'use', 'used', 'useful', 'uses', 'using', 'usually', 'value', 'various', 'very', 'via', 'viz', 'vs', 'want', 'wants', 'was', 'wasn’t', 'way', 'we', 'we’d', 'we’ll', 'we’re', 'we’ve', 'welcome', 'well', 'went', 'were', 'weren’t', 'what', 'what’s', 'whatever', 'when', 'whence', 'whenever', 'where', 'where’s', 'whereafter', 'whereas', 'whereby', 'wherein', 'whereupon', 'wherever', 'whether', 'which', 'while', 'whither', 'who', 'who’s', 'whoever', 'whole', 'whom', 'whose', 'why', 'will', 'willing', 'wish', 'with', 'within', 'without', 'won’t', 'wonder', 'would', 'would', 'wouldn’t', 'yes', 'yet', 'you', 'you’d', 'you’ll', 'you’re', 'you’ve', 'your', 'yours', 'yourself', 'yourselves', 'zero'];
db.on('error', console.error.bind(console, 'connection error:'));
var shouldExtract = true;
db.once('open', function() {
  Comment.find()
  .exec(function(error, comments) {

    var fucksGiven = [];
    var singleFucksGiven = [];

    var authors = _.chain(comments)
      .groupBy('author')
      .map(function(a) {
        return {name: a[0].author, total: a.length };
      })
      .value();
    authors.sort(function(a, b) { return b.total - a.total; });
    console.log('authors:', authors);
    
    var topAuthor = authors[0];
    console.log('top author:', topAuthor);
    

    var library = '';
    for(var i = 0; i < comments.length; i++ ) {
      var c = comments[i];
      library += c.cleanedBody.toLowerCase().replace(/[^\w\s]/gi, '') + '\n';
    }

    var total = 0;
    total = library.match(/fuck/gi).length;

    console.log('total:', total);
    console.log('scanning for ngrams');
    
    var fucks;
    
    if(shouldExtract) {
      fucks = gramophone.extract(library, {ngrams: [1,2,3,4,5], stem: false, score: true, startWords:startWords, cutoff: 0.3});
      fs.writeFileSync('./fucks.json', JSON.stringify(fucks));
      console.log('wrote fucks.json');
    } else {
      fucks = require('./fucks.json');
      console.log('loaded fucks.json');
    }
    console.log('ngrams found...');
    
    fucks = _.filter(fucks, function(fuck) {
      return fuckPattern.test(fuck.term);
    });
    
    fucks.sort(function(a,b) {
      return b.tf - a.tf;
    });
    
    singleFucksGiven = _.remove(fucks, function(fuck) {
      return singleFuckPattern.test(fuck.term);
    });
    
    var deferredList = [];
    
    _.first(fucks,1000).forEach(function(fuck) {
      var deferred = Q.defer();
      deferredList.push(deferred.promise);
      var termPattern = new RegExp(fuck.term);
      var sentenceString = '((\\w*\\s*){0,5}' + fuck.term + '(\\w*\\s*){0,5})(.*)';
      var sentencePattern = new RegExp(sentenceString, 'gi');
      var termComments = [];
      console.log('searching for:', fuck.term, termPattern);

      Comment.find({cleanedBody: termPattern}, function(err, docs) {
        if(err) {
          throw err;
        }
        console.log('found: ', docs.length, fuck.term);
        _.each(docs, function(comment) {
          var matches = sentencePattern.exec(comment.body.replace(/[^\w\s]/gi,''));
          var sentence, obj;
          if(matches) {
            var sentence = '...' + matches[1].trim() + '...';
            //console.log(sentence);
            obj = {sentence: sentence, author: comment.author, permalink: comment.permalink, linkTitle: comment.link_title };
            termComments.push(obj);
          }
        });
        fuck.comments = termComments;
        fucksGiven.push(fuck);
        deferred.resolve();
      });
    });
    Q.all(deferredList).then(function() {
      console.log('all searches finished');
      var fuckRecord = new Fuck({
              created: Date.now(),
              ngrams: fucksGiven,
              total: total,
              top: topAuthor
            });
      fuckRecord.save(function(err) {
        if(err) {
          throw err;
        }
        console.log('created new fuck entry');
      });

      var singleFuckRecord = new SingleFuck({
                created: Date.now(),
                ngrams: singleFucksGiven,
                total: total,
                top: topAuthor
              });
      singleFuckRecord.save(function(err) {
        if(err) {
          throw err;
        }
        console.log('created new singlefuck entry');
      });

      var author;
      for(var i = 0; i < authors.length; i++) {
        author = authors[i];
        var newAuthor = new Author({
          created: Date.now(),
          name: author.name,
          total: author.total
        });
        newAuthor.save(function(err) {
          if(err) { 
            throw(err);
          }
        });
      }
    });
  });
});