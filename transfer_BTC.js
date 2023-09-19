const btcBasic = require('./btcBasic');

const btc = new btcBasic('BTC')

// 从命令行参数中获取充值地址和转账金额
const address = process.argv[2];
const transferAmount = parseFloat(process.argv[3]);

btc.sendBTC(address, transferAmount)