var unirest = require('unirest');
var Q = require('q');
var request = require('request');

var googleFinanceURL = 'http://finance.google.com/finance/';
var financeURL = googleFinanceURL + 'info';
var autoCompleteURL = googleFinanceURL + 'match';

var google = {
  getStock: function(ticker) {
    var deferred = Q.defer();

    var options = {
      method: 'GET',
      url: financeURL,
      qs: {
        q: ticker
      },
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/xml'
      }
    }
    request(options, function(error, response, body) {
      if (error) deferred.reject(error);
      else deferred.resolve(body);
    });
    return deferred.promise;
  },
  autoComplete: function(term) {
    var deferred = Q.defer();
    var options = {
      method: 'GET',
      url: autoCompleteURL,
      qs: {
        q: term
      },
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/xml'
      }
    };
    request(options, function(error, response, body) {
      if (error) deferred.reject(error);
      else deferred.resolve(body);
    });
    return deferred.promise;
  }
}

module.exports = google;
