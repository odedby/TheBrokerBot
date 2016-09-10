var google = require('../utils/google');
var Q = require('q');
var fs = require('fs');
var request = require('request');
var arrColors = ['black', 'blue', 'dg', 'gold', 'grey', 'lg', 'orange', 'pink', 'red', 'violet'];
var returnURL = 'http://res.cloudinary.com/aiua/image/upload/g_north_west,l_text:black_16:name:,x_5,y_10/g_north_west,l_text:dark_blue_16:[STOCK_NAME],x_100,y_7/g_north_west,l_text:black_16:price:,x_5,y_32/g_north_west,l_text:dark_blue_16:[STOCK_PRICE],x_100,y_32/g_north_west,l_text:black_16:change:,x_5,y_57/g_north_west,l_text:[CHANGE_COLOR]:[STOCK_CHANGE],x_100,y_57/g_north_west,l_text:black_16:change(%25):,x_5,y_82/g_north_west,l_text:[CHANGE_COLOR]:[STOCK_CHANGE_PERCENT]%25,x_100,y_82/g_north_west,l_text:black_16:updated:,x_5,y_107/g_north_west,l_text:dark_blue_16:[STOCK_UPDATE],x_100,y_107/v1466851172/e6kucoxw9eqpbxwlprrg.jpg';

var data = {
  getArticles: function (opts, inlineQueryId) {
    var deferred = Q.defer();
    var ans = [];
    var promises = [];
    for(var i=0; i<opts.matches.length && i<5; i++)
    {
      promises.push(google.getStock(opts.matches[i].t + ', ' + opts.matches[i].n + ', ' + opts.matches[i].e));
    }
    Promise.all(promises).then(function(data) {
      for(var i=0; i<data.length; i++)
      {
        var answer = JSON.parse("{\"results\":[" + data[i].slice(data[i].indexOf('{'), data[i].length-2) + "]}");
        console.log(answer);
        for(var j=0;j<answer.results.length; j++)
        {
          var indColor = Math.floor((Math.random() * arrColors.length));
          var changeColor;
          if(parseFloat(answer.results[j].c) > 0)
          {
            changeColor = 'green_16';
          }
          else if(parseFloat(answer.results[j].c) < 0)
          {
            changeColor = 'red_16';
          }
          else {
            changeColor = 'dark_blue_16';
          }
          if(!answer.results[j].c || parseFloat(answer.results[j].c) == 0)
          {
            answer.results[j].c = '0.0';
            answer.results[j].cp = '0.0';
            answer.results[j].ltt = 'Not Applicable';
          }
          answer.results[j].t = replaceAll(answer.results[j].t, ',', '%E2%80%9A');
          answer.results[j].e = replaceAll(answer.results[j].e, ',', '%E2%80%9A');
          answer.results[j].l = replaceAll(answer.results[j].l, ',', '%E2%80%9A');
          answer.results[j].c = replaceAll(answer.results[j].c, ',', '%E2%80%9A');
          answer.results[j].cp = replaceAll(answer.results[j].cp, ',', '%E2%80%9A');
          answer.results[j].ltt = replaceAll(answer.results[j].ltt, ',', '%E2%80%9A');
          var photoURL = returnURL.replace('[STOCK_NAME]', answer.results[j].t + ' ' + answer.results[j].e)
          .replace('[STOCK_PRICE]',answer.results[j].l)
          .replace('[STOCK_CHANGE]', answer.results[j].c)
          .replace('[STOCK_CHANGE_PERCENT]',answer.results[j].cp)
          .replace('[STOCK_UPDATE]', answer.results[j].ltt)
          .replace('[CHANGE_COLOR]', changeColor)
          .replace('[CHANGE_COLOR]', changeColor);
          var relativePhotoURL = inlineQueryId + '_' + ans.length.toString() + '.png';
          download(photoURL, '././images/results/' + relativePhotoURL, function(){});
          var thumbURL = (answer.results[j].t.charAt(0).toLowerCase() != '.') ? 'http://oded.by/letters/' + answer.results[j].t.charAt(0).toLowerCase() + '_' + arrColors[indColor] + '.jpg' :
          'http://oded.by/letters/' + answer.results[j].t.charAt(1).toLowerCase() + '_' + arrColors[indColor] + '.jpg'
          ans.push(
          {
            type: 'article',
            id: ans.length.toString(),
            title: answer.results[j].t + ' ' + answer.results[j].e,
            input_message_content: {
              message_text: 'http://oded.by/results/' + relativePhotoURL
            },
            thumb_url: thumbURL
          });
          /*console.log(ans[ans.length-1]);
          ans.push(
          {
            type: 'photo',
            id: ans.length.toString(),
            title: answer.results[j].t + ' ' + answer.results[j].e,
            photo_url: 'http://oded.by/results/' + relativePhotoURL,
            thumb_url: 'http://oded.by/letters/' + answer.results[j].t.charAt(0).toLowerCase() + '_' + arrColors[indColor] + '.jpg'
          });
          console.log(ans[ans.length-1]);
          ans.push(
          {
            type: 'article',
            id: ans.length.toString(),
            title: answer.results[j].t + ', ' + answer.results[j].e,
            input_message_content: {
              message_text: 'stock: ' + answer.results[j].t + ', ' + answer.results[j].e +
              '\nprice: ' + answer.results[j].l +
              '\nchange: ' + answer.results[j].c +
              '\nchange(%): ' + answer.results[j].cp + '%' +
              '\nupdated: ' + answer.results[j].ltt
            },
            thumb_url: 'http://oded.by/letters/' + answer.results[j].t.charAt(0).toLowerCase() + '_' + arrColors[indColor] + '.jpg'
          });*/
        }
      }
      deferred.resolve(ans);
    }).catch(function(err) {
      console.log(err);
      deferred.reject(err);
  });
  return deferred.promise;
  },
  isEmpty: function (obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  },
  cleanEmptyThumb_urls: function(user) {
    // Remove empty strings as dynamoDB can't put item with empty strings
    for(var i=0; i<user.articles.length; i++)
    {
      if(user.articles[i].thumb_url == '')
      {
        user.articles[i].thumb_url = 'NULL';
      }
    }
    return user;
  },
  createPhoto: function(chatId, answer) {
    var changeColor;
    if(parseFloat(answer.c) > 0)
    {
      changeColor = 'green_16';
    }
    else if(parseFloat(answer.c) < 0)
    {
      changeColor = 'red_16';
    }
    else {
      changeColor = 'dark_blue_16';
    }
    if(!answer.c || parseFloat(answer.c) == 0)
    {
      answer.c = '0.0';
      answer.cp = '0.0';
      answer.ltt = 'Not Applicable';
    }
    answer.t = replaceAll(answer.t, ',', '%E2%80%9A');
    answer.e = replaceAll(answer.e, ',', '%E2%80%9A');
    answer.l = replaceAll(answer.l, ',', '%E2%80%9A');
    answer.c = replaceAll(answer.c, ',', '%E2%80%9A');
    answer.cp = replaceAll(answer.cp, ',', '%E2%80%9A');
    answer.ltt = replaceAll(answer.ltt, ',', '%E2%80%9A');
    var photoURL = returnURL.replace('[STOCK_NAME]', answer.t + ' ' + answer.e)
    .replace('[STOCK_PRICE]',answer.l)
    .replace('[STOCK_CHANGE]', answer.c)
    .replace('[STOCK_CHANGE_PERCENT]',answer.cp)
    .replace('[STOCK_UPDATE]', answer.ltt)
    .replace('[CHANGE_COLOR]', changeColor)
    .replace('[CHANGE_COLOR]', changeColor);
    var relativePhotoURL = chatId + '_' + new Date().getTime() + '.png';
    download(photoURL, '././images/results/' + relativePhotoURL, function(){});
    return 'http://oded.by/results/' + relativePhotoURL;
  }
}

var replaceAll = function (str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

module.exports = data;
