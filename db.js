var mysql = require('mysql');


module.exports = function(config) {
	var connection = mysql.createConnection(config);

	connection.connect();
	return connection;
}