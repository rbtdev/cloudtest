var pkgcloud = require('pkgcloud');
var async = require('async');
var _ = require('underscore');
var program = require('commander');


// Defaults for rackspace cloud
var TEST_LB_ID = 'xxx';
var RS_API_KEY = 'xxx';
var RS_USERNAME = 'xxx';
var RS_REGION = 'xxx';
var CLOUD_PROVIDER = 'xxx';

program
  .version('0.0.1')
  .option('-u, --username [name]', 'provider username', RS_USERNAME)
  .option('-p, --provider [name]', 'Cloud provider', CLOUD_PROVIDER)
  .option('-k, --api-key [key]', 'provider API key', RS_API_KEY)
  .option('-r, --region [region]', 'Region', RS_REGION)
  .option('-b, --load-balancer-id [id]', 'Load Balancer ID', TEST_LB_ID)
  .parse(process.argv);

var RS_AUTH = {
    apiKey: program.apiKey, // your api key here
    username: program.username, // username as well
    region: program.region,
    provider: program.provider
}
var serverClient = pkgcloud.compute.createClient(RS_AUTH);
var lbClient = pkgcloud.loadbalancer.createClient(RS_AUTH);


function ensureStatus(loadBalancerId, callback) {
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

serverClient.getServers(function (err, servers) {
  debugger
})
serverClient.getFlavors(function (err, flavors) {
 var names = '-- Flavors Available --\n';
  for (var i = flavors.length - 1; i >= 0; i--) {
    names += flavors[i].name + '\n';
  };
  console.log(names);});

serverClient.getImages(function (err, images) {
  var names = '-- Images Available --\n';
  for (var i = images.length - 1; i >= 0; i--) {
    names += images[i].name + '\n';
  };
  console.log(names);
});

ensureStatus(program.loadBalancerId, function (err, lb) {
  if (err) {
    console.log('ERROR: ' + JSON.stringify(err))
  }
  else {
    console.log('Load Balancer is ACTIVE');
    console.log('Getting nodes...');
    lb.getNodes(function (err, nodes) {
      if (!err) {
        console.log('Got Nodes.')    
      }
      else {
        console.log('ERROR: ' + JSON.stringify(err));
      }
    });
    lb.getStats(function (err, stats) {
      if (!err) {
        console.log('Got Stats: ' + JSON.stringify(stats))  
        debugger  
      }
      else {
        console.log('ERROR: ' + JSON.stringify(err));
      }
    });
  }
})
