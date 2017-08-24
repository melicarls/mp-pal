require('dotenv').config();
var express = require('express');
var request = require('request');

var app = express();

var session_token = '';
var target_schedule_id = '';

app.get('/', function(req, res) {
  res.send("Hello World!");
});

app.listen(8888, function() {
  console.log("Listening on port 8888");
});


function submitLogin() {
  var options = {
    url: "https://secure." + process.env.SERVICE + ".com/1/login",
    headers: {
      "Accept": "application/json",
      "Host": "secure." + process.env.SERVICE + ".com",
      "Connection": "keep-alive",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Content-Type": "application/json;charset=UTF-8",
      "Referer": "https://secure." + process.env.SERVICE + ".com/login",
      "Origin": "https://secure." + process.env.SERVICE + ".com"
    },
    body: {
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    }
  };

  request(options, function( error, response, body ) {
    if ( !error && response.statusCode === 200 ) {
      var data = JSON.parse(body);

      sesson_token = info.sessionToken.split(':')[1];
      return session_token;
    }
  });
}

function getMenu() {
  var options = {
    url: "https://secure." + process.env.SERVICE + ".com/1/functions/getByCity",
    headers: {
      "Accept": "application/json",
      "Host": "secure." + process.env.SERVICE + ".com",
      "Connection": "keep-alive",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Content-Type": "application/json;charset=UTF-8",
      "Referer": "https://secure." + process.env.SERVICE + ".com/login",
      "Origin": "https://secure." + process.env.SERVICE + ".com"
    },
    body: {
      cityId: "00000000-1000-4000-9091-919aa43e4747"
    }
  };

  request(options, function( error, response, body ) {
    if ( !error && response.statusCode === 200 ) {
      var data = JSON.parse(body);
      target_schedule_id = getScheduleId( data );
    }
  });
}

function reserveMeal() {
  var options = {
    url: "https://secure." + process.env.SERVICE + ".com/api/v2/reservations",
    headers: {
      "Accept": "application/json",
      "Host": "secure." + process.env.SERVICE + ".com",
      "Connection": "keep-alive",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Content-Type": "application/json;charset=UTF-8",
      "Referer": "https://secure." + process.env.SERVICE + ".com/main",
      "Origin": "https://secure." + process.env.SERVICE + ".com"
      // TODO: Add cookie
    },
    body: {
      pickup_time: "12:45-1:00pm",
      quantity: 1,
      schedule_id: target_schedule_id,
      source: "web"
    }
  }
}


function getScheduleId( menu_list ) {
  menu_list.forEach( function( menu_option ) {
    // TODO: Expand this to reserve different things on different days
    if ( menu_option.restaurant.name === "Sababa" ) {
      return menu_option.objectId;
    }
  });
}

// headers for post:
    headers: {
      "Accept": "application/json",
      "Host": "secure." + process.env.SERVICE + ".com",
      "Connection": "keep-alive",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Content-Type": "application/json;charset=UTF-8",
      "Referer": "https://secure." + process.env.SERVICE + ".com/main",
      "Origin": "https://secure." + process.env.SERVICE + ".com"
    },
