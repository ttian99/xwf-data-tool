var pg = require('pg');

/**************** svrtest pc:ubuntu ********************/
var config1 = {
  user: 'ubuntu', //env var: PGUSER 
  database: 'xwfdb', //env var: PGDATABASE 
  password: '123', //env var: PGPASSWORD 
  port: 5432, //env var: PGPORT 
  max: 10, // max number of clients in the pool 
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed 
};

var pool = new pg.Pool(config1);

// var sqlStr = 'SELECT * FROM room limit 10;';
var search = function(sqlStr, cb) {
  console.log('--- connect postsql ---');
  pool.connect(function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }

    console.log('--- query postsql ---');
    client.query(sqlStr, [], function(err, result) {
      //call `done()` to release the client back to the pool 
      done();

      if (err) {
        return console.error('error running query', err);
      } else {
        console.log("-- result.rows.number = " + result.rows.number);
        // console.log(result.rows);
        //output: 1 
        var data = result.rows;
        cb(null, data);
      }
    });
  });
}

pool.on('error', function(err, client) {
  console.error('idle client error', err.message, err.stack)
});


module.exports = search;