var unirest = require('unirest');

var telegram = {
 bot: function (token) {
   var baseURL = 'https://api.telegram.org/bot' + token + '/';
   var sendMessageURL = baseURL + 'sendMessage';
   var sendPhotoURL = baseURL + 'sendPhoto';
   var answerInlineQueryURL = baseURL + 'answerInlineQuery';
   var bot = {
     sendMessage: function(chatId, message) {
       var answer = {
     		chat_id: chatId,
     		text: message
     	}
       unirest.post(sendMessageURL).send(answer).end(function(response){});
     },
     sendPhoto: function(chatId, photo) {
       var answer = {
     		chat_id: chatId,
        caption: 'papo',
        file_id: '1',
       		photo: photo
     	}
       unirest.post(sendPhotoURL).send(answer).end(function(response){console.log(response);});
     },

     answerInline: function(inlineQueryId, results) {
       var answerInlineQuery = {
         inline_query_id: inlineQueryId,
         results: JSON.stringify(results)
           /*[{
            type: 'gif',
            id: '1',
            gif_url: 'http://24.media.tumblr.com/tumblr_lgpu4kNwVb1qcn249o1_100.gif',
            gif_width: 250,
            gif_height: 250,
            thumb_url: 'http://24.media.tumblr.com/tumblr_lgpu4kNwVb1qcn249o1_100.gif'
        },
        {
           type: 'gif',
           id: '2',
           gif_url: 'http://25.media.tumblr.com/tumblr_m3ct9hGEw41rtbmh0o1_250.gif',
           gif_width: 250,
           gif_height: 250,
           thumb_url: 'http://25.media.tumblr.com/tumblr_m3ct9hGEw41rtbmh0o1_250.gif'
        },
      {
        type: 'article',
        id: '3',
        title: 'NOK',
        input_message_content: {
          message_text: 'Nok'
        }
      }
    ])*/
       };
       unirest.post(answerInlineQueryURL).send(answerInlineQuery).end(function(response){});
     }
   };
   return bot;
 }
}

module.exports = telegram;
