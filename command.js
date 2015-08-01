var program = require('commander');
 
program
  .version('0.0.1')

program
  .command('cloud', 'test cloud package')
  
program.parse(process.argv);