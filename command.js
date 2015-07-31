var program = require('commander');
 
program
  .version('0.0.1')
  .option('-p, --peppers', 'Add peppers')
  .option('-P, --pineapple', 'Add pineapple')
  .option('-b, --bbq-sauce [type]', 'Add bbq sauce', 'spicy')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .command('cloud', 'list servers')
  .command('test', 'test command')
  .action(function (cmd, env) {
    debugger;
  })
  .parse(process.argv);
 
console.log('you ordered a pizza with:');
if (program.peppers) console.log('  - peppers');
if (program.pineapple) console.log('  - pineapple');
console.log('  - %s bbq', program.bbqSauce);
console.log('  - %s cheese', program.cheese);