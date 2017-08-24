require( 'dotenv' ).config();

var express = require( 'express' );
var request = require( 'request' );
var moment = require( 'moment' );
var winston = require( 'winston' )
winston.add( winston.transports.File, { filename: 'server-log.log' } );

var app = express();

var session_token = '';
var target_restaurant = '';
var target_schedule_id = '';

app.get('/', function( req, res ) {
  res.send( "Hello World!" );
} );

app.listen( process.env.PORT || 8888, function() {
  console.log( "Listening on port 8888" );
  beginLoop();
} );

function beginLoop() {
  setTimeout( function() {
    winston.info('Doing a loop at ' + moment() )

    checkAndExecuteOrder();
    beginLoop();

  }, 5000 );
}

function checkAndExecuteOrder() {
  if ( moment().get('hour') === 17 ) {
    switch( moment().day() ) {
      case 1: // Monday
        target_restaurant = 'Sababa';

      case 2: // Tuesday
        target_restaurant = 'Sababa';

      case 4: // Thursday
        target_restaurant = 'Sababa';

      case 5: // Friday
        target_restaurant = 'Sababa';

      default:
        sleepUntilTomorrow();
    }

    submitLogin();
    getMenu();
    reserveMeal();
  }
}

function sleepUntilTomorrow() {
  setTimeout( function() {
    winston.info( "Sleeping for 23 hours" );
  }, 3600000 )
}

function submitLogin() {
  var body = {
    "username": process.env.USERNAME,
    "password": process.env.PASSWORD
  }

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
    body: JSON.stringify(body)
  };

  request.post( options, function( error, response, body ) {
    checkAndHandleError( error );

    if ( !error && response['statusCode'] === 200 ) {
      var data = JSON.parse( body );
      winston.info( 'Here is the login response: ' + data );

      session_token = data['sessionToken'].split( ':' )[1];

      winston.info('Got this token: ' + session_token )
      return session_token;
    }
  } );
}

function getMenu() {
  var body = {
    "cityId": "00000000-1000-4000-9091-919aa43e4747"
  }

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
    body: JSON.stringify(body)
  };

  request.post( options, function( error, response, body ) {
    checkAndHandleError( error );

    if ( !error && response['statusCode'] === 200 ) {
      var data = JSON.parse( body );
      winston.info( 'Here is the menu we got: ' + data )
      target_schedule_id = getScheduleId( data );
    }
  } );
}

function reserveMeal() {
  var body = {
    "pickup_time": "12:45-1:00pm",
    "quantity": 1,
    "schedule_id": target_schedule_id,
    "source": "web"
  }

  var options = {
    url: "https://secure." + process.env.SERVICE + ".com/api/v2/reservations",
    headers: {
      "Accept": "application/json",
      "Host": "secure." + process.env.SERVICE + ".com",
      "Connection": "keep-alive",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Content-Type": "application/json;charset=UTF-8",
      "Referer": "https://secure." + process.env.SERVICE + ".com/main",
      "Origin": "https://secure." + process.env.SERVICE + ".com",
      "Cookie": "_mealpal_session=" + session_token + "; isLoggedIn=true;"
    },
    body: JSON.stringify(body)
  }

  request.post( options, function( error, response, body ) {
    checkAndHandleError( error );

    if ( !error && response['statusCode'] === 200 ) {
      var data = JSON.parse( body );
      winston.info('Response from reserving meal:');
      winston.info( data );

      sleepUntilTomorrow();
    }
  } );
}

function getScheduleId( menu_list ) {
  for ( var i = 0; i < menu_list.length; i++ ) {
    if ( menu_list[i]['restaurant']['name'] === target_restaurant ) {
      return menu_list[i]['objectId'];
    }
  }
}

function checkAndHandleError( error ) {
  if ( error ) {
    winston.info( '!-!-!-!-! AN ERROR HAS OCCURRED !-!-!-!-!' );
    winston.info( error );
    winston.info( '^-^-^-^-^ CHECK OUT THAT ERROR ^-^-^-^-^-^' )
  }
}
