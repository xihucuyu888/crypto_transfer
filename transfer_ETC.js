const ethBasic = require('./ethBasic');

const etc = new ethBasic('ETC')

// 从命令行参数中获取充值地址和转账金额
const address = process.argv[2];
const transferAmount = parseFloat(process.argv[3]);

etc.sendEth(address, transferAmount)

// node transfer_ETH.js 0xEc67A59e54A393b702c7EcCe1faca731E4f0e601 0.0001123