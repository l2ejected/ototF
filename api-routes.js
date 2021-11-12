let router = require('express').Router();
let redis = require('redis');
let axios = require('axios');

var client = redis.createClient();
const endpoint = 'http://jsonplaceholder.typicode.com/todos'

client.on('error', error => {
  console.log(error);
});

router.get('/', function (req, res) {
  client.get('cached_data', function (err, reply) {
    if (reply === null) {
      console.log('cache miss')
      axios.get(endpoint)
        .then(retrievalResponse => retrievalResponse.data)
        .then(data => {
          client.set('cached_data', JSON.stringify(data));
          res.status(200).json(data);
        });
    } else {
      console.log('cache hit');
      res.status(200).json(JSON.parse(reply));
    }
  });
});

router.get('/flush', function (req, res) {
  client.flushall(function (err, success) {
    if (success) {
      res.status(200)
        .json({
          message: 'Cache flushed successfully.'
        });
    } else {
      res.status(400)
        .json({
          message: 'Cache flush failed.'
        });
    }
  });
});

module.exports = router