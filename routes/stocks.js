var express = require('express');
var bodyParser = require('body-parser');
var unirest = require('unirest');
var router = express.Router();
var telegram = require('../utils/telegram');
var google = require('../utils/google');
var dataUtils = require('../utils/data');
var dynamoDB = require('../utils/dynamoDB');
var bot = telegram.bot('187956464:AAHJu_uWPpKgenCFde0jxryk077-ZuaQvjM');
var helpMessage = 'This bot can be used to get the latest value of stocks.\nIt is better used in inline mode (to share info with friends).';
var invalidTickerMessage = 'Invalid ticker';

var users = [];

router.get('/', function (req, res) {
	console.log('in stocks frame');
	res.send('success-get');
});

router.post('/', function (req, res) {
try
{
	console.log(req.body);
	//	If called inside the bot chat
	if(req.body.message)
	{
		var inMessage = req.body.message;
		var chatId = inMessage.chat.id;
		if(inMessage.text && (inMessage.text.toLowerCase() == '/help' || inMessage.text.toLowerCase() == '/start'))
		{
			console.log(inMessage.text);
			bot.sendMessage(chatId, helpMessage);
		}
		else {
			google.getStock(inMessage.text).then(function(data) {
				if(data.indexOf('Response Code 400') > 0) {
					bot.sendMessage(chatId, invalidTickerMessage);
				}
				else {
					var answer = JSON.parse(data.slice(data.indexOf('{'), data.length-2));
					var url = dataUtils.createPhoto(chatId, answer);
					bot.sendMessage(chatId, url);
				}
			});
		}
	}
	//	If using the bot inline
	else if(req.body.inline_query)
	{
		var inlineQueryId = req.body.inline_query.id;
		var inlineText = req.body.inline_query.query;
		var userId = req.body.inline_query.from.id;
		google.autoComplete(inlineText).then(function(data) {
			var opts = JSON.parse(data);
			dataUtils.getArticles(opts, inlineQueryId).then(function(data){
				var arrArticles = data;
				bot.answerInline(inlineQueryId, arrArticles);
				var user = dynamoDB.getUser(userId.toString()).then(function(data) {
					if(dataUtils.isEmpty(data)) {
						console.log('user does not exist');
						var newUser = {'userId':userId.toString(),
						'articles':arrArticles,
						'first_name': req.body.inline_query.from.first_name,
						'last_name': req.body.inline_query.from.last_name,
						'username': req.body.inline_query.from.username };
						dynamoDB.setUser(dataUtils.cleanEmptyThumb_urls(newUser));
					}
					else {
						var updateUser = {'userId':userId.toString(),
						'articles':arrArticles,
		        'first_name': req.body.inline_query.from.first_name,
		        'last_name': req.body.inline_query.from.last_name,
		        'username': req.body.inline_query.from.username };
						dynamoDB.updateUser(dataUtils.cleanEmptyThumb_urls(updateUser));
					}
				});
			});
		})
	}
	else if(req.body.chosen_inline_result)
	{
		var text = req.body.chosen_inline_result.query;
		var updateId = req.body.update_id;
		var userId = req.body.chosen_inline_result.from.id;
		var selectedId = req.body.chosen_inline_result.result_id;
		var user = dynamoDB.getUser(userId.toString()).then(function(data) {
			if(dataUtils.isEmpty(data)) {
				console.log('ERROR: user does not exist');
			}
			else {
				var arrArticles = data.Item.articles;
				google.getStock(arrArticles[selectedId].title).then(function(data) {
					var answer = JSON.parse(data.slice(data.indexOf('{'), data.length-2));
					console.log(answer);
					bot.sendMessage(updateId, answer.l);
				});
			}
		});
	}
}
catch(error)
{
	console.log(error);
}
	res.statusCode = 200;
	res.send('200');
});


module.exports = router;
