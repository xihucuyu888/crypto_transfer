const litecore = require('bitcore-lib-ltc')
const network = litecore.Networks.testnet
var privateKey = new litecore.PrivateKey();

var address = privateKey.toAddress(network);

console.log(privateKey.toString(),address.toString())