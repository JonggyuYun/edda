var generic_pool = require('generic-pool');
var mysql = require('mysql');
var config = {
                connectionLimit : 100,
                waitForConnections : true,
    host: 'ls-53e8c7fb8ec5b061112333c1f8927fa2d306d333.cdw11wihkruj.ap-northeast-2.rds.amazonaws.com',
    user: 'dbmasteruser',
    password: 'edda123$',
    database: 'edda',
                wait_timeout : 28800,
                connect_timeout :10
            };
var connection = mysql.createPool(config);
// host: 'nodejs-003.cafe24.com',
//     user: 'ydilkp',
//     password: 'ydimysql123!',
//     database: 'ydilkp',

// host: 'localhost',
//     user: 'root',
//     password: 'stevencorp',
//     database: 'ydi',

//-
//- Establish a new connection
//-
connection.getConnection(function(err){
    if(err) {
        // mysqlErrorHandling(connection, err);
        console.log("\n\t *** Cannot establish a connection with the database. ***");

        connection = reconnect(connection);
    }else {
        console.log("\n\t *** New connection established with the database. ***")
    }
});


//-
//- Reconnection function
//-
function reconnect(connection){
    console.log("\n New connection tentative...");

    //- Create a new one
    connection = mysql.createPool(config);

    //- Try to reconnect
    connection.getConnection(function(err){
        if(err) {
            //- Try to connect every 2 seconds.
            setTimeout(reconnect(connection), 2000);
        }else {
            console.log("\n\t *** New connection established with the database. ***")
            return connection;
        }
    });
}


//-
//- Error listener
//-
connection.on('error', function(err) {

    //-
    //- The server close the connection.
    //-
    if(err.code === "PROTOCOL_CONNECTION_LOST"){    
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return reconnect(connection);
    }

    else if(err.code === "PROTOCOL_ENQUEUE_AFTER_QUIT"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return reconnect(connection);
    }

    else if(err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return reconnect(connection);
    }

    else if(err.code === "PROTOCOL_ENQUEUE_HANDSHAKE_TWICE"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
    }

    else{
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return reconnect(connection);
    }

});


		/*var connection;

		function handleDisconnect() {
		  connection = mysql.createConnection(db_config); // Recreate the connection, since
		                                                  // the old one cannot be reused.

		  connection.connect(function(err) {              // The server is either down
		    if(err) {                                     // or restarting (takes a while sometimes).
		      console.log('error when connecting to db:', err);
		      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
		    }                                     // to avoid a hot loop, and to allow our node script to
		  });                                     // process asynchronous requests in the meantime.
		                                          // If you're also serving http, display a 503 error.
		  connection.on('error', function(err) {
		    console.log('db error', err);
		    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
		      handleDisconnect();                         // lost due to either server restart, or a
		    } else {                                      // connnection idle timeout (the wait_timeout
		      throw err;                                  // server variable configures this)
		    }
		  });
		}

		handleDisconnect();*/
 
 
module.exports = connection;