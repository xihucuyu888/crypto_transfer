const ethBasic = require('./ethBasic');

const opeth = new ethBasic('OPETH')

// 从命令行参数中获取充值地址和转账金额
const address = process.argv[2];
const transferAmount = parseFloat(process.argv[3]);
const token = process.argv[4];

opeth.sendErc20(token, address, transferAmount)

// node transfer_OPETH_ERC20.js 0xEc67A59e54A393b702c7EcCe1faca731E4f0e601 1 OP
