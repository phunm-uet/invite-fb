const schedule = require('node-schedule')
var j = schedule.scheduleJob('*/1 * * * *', function(){
    console.log(new Date())
    console.log('The answer to life, the universe, and everything!');
  });