const ethBasic = require('./ethBasic');

const linea = new ethBasic('LINEAETH')

// 从命令行参数中获取充值地址和转账金额
const address = process.argv[2];
const transferAmount = parseFloat(process.argv[3]);

linea.sendEth(address, transferAmount)
