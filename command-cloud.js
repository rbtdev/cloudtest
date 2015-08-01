var pkgcloud = require('pkgcloud');
var async = require('async');
var _ = require('underscore');
var program = require('commander');
var env = require('./config.js');

program
  .version('0.0.1')
  .option('-u, --username [name]', 'provider username', env.settings.username)
  .option('-p, --provider [provider]', 'Cloud provider', env.settings.provider)
  .option('-k, --api-key [key]', 'provider API key', env.settings.apiKey)
  .option('-r, --region [region]', 'Region', env.settings.region)
  .option('-b, --load-balancer-id [id]', 'Load Balancer ID', env.settings.loadBalancerId)
program
  .command('config')
  .description('Show default config settings')
  .action (function () {
    console.log(JSON.stringify(env, null, 4));
  })
program
  .command('servers')
  .description('Show list of available servers')
  .action (servers)
program
  .command('flavors')
  .description('Show list of available flavors')
  .action (flavors)
program
  .command('images')
  .description('Show list of available images')
  .action (images)
program.parse(process.argv);

function serverClient () {
  var auth = {
    apiKey: program.apiKey, // your api key here
    username: program.username, // username as well
    region: program.region,
    provider: program.provider
  }
  console.log("Connecting...");
  return pkgcloud.compute.createClient(auth);
}

function flavors () {
  var client = serverClient();
  console.log("Getting available flavors...");
  client.getFlavors(function (err, flavors) {
    var names = '-- Flavors Available --\n';
    for (var i = flavors.length - 1; i >= 0; i--) {
      names += flavors[i].name + '\n';
    };
    console.log(names);
  });
}

function images() {
  var client = serverClient();
  console.log("Getting available images...");
  client.getImages(function (err, images) {
    var names = '-- Images Available --\n';
    for (var i = images.length - 1; i >= 0; i--) {
      names += images[i].name + '\n';
    };
    console.log(names);
  });
}

function servers () {
  var client = serverClient()
  console.log("Getting available servers...");
  client.getServers(function (err, servers) {
    var names = '-- Servers Available --\n';
    for (var i = servers.length - 1; i >= 0; i--) {
      names += servers[i].name + '\n';
    };
    console.log(names);
  });
};

function ensureStatus(loadBalancerId, callback) {
  var auth = {
    apiKey: program.apiKey, // your api key here
    username: program.username, // username as well
    region: program.region,
    provider: program.provider
  }
  var lbClient = pkgcloud.loadbalancer.createClient(auth);
  lbClient.getLoadBalancer(loadBalancerId, function(err, lb) {
      if (err) {
          callback(err);
          return;
      }

      // We don't want to to do anything if we're not in a known state to begin with
      if (lb.status !== 'ACTIVE') {
          callback(new Error('Load Balancer status not active'));
          return;
      }

      // check the status of each nodes. We want all of our nodes enabled
      // before we begin rotating nodes in and out
      if (_.any(lb.nodes, function(node) {
          return node.condition !== 'ENABLED';
      })) {
          callback(new Error('All nodes must be condition:ENABLED to deploy'));
          return;
      }

      // If you want to any app specific validation, you could call out to that here

      // If we meet a minimum validation, lets callback with no errors
      callback(null, lb);
    });
}


// ensureStatus(program.loadBalancerId, function (err, lb) {
//   if (err) {
//     console.log('ERROR: ' + JSON.stringify(err))
//   }
//   else {
//     console.log('Load Balancer is ACTIVE');
//     console.log('Getting nodes...');
//     lb.getNodes(function (err, nodes) {
//       if (!err) {
//         console.log('Got Nodes.')    
//       }
//       else {
//         console.log('ERROR: ' + JSON.stringify(err));
//       }
//     });
//     lb.getStats(function (err, stats) {
//       if (!err) {
//         console.log('Got Stats: ' + JSON.stringify(stats))  
//         debugger  
//       }
//       else {
//         console.log('ERROR: ' + JSON.stringify(err));
//       }
//     });
//   }
// })

