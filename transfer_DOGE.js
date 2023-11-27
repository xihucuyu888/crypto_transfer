const coininfo = require('coininfo')
const btcBasic = require('./btcBasic');
const dogecoin = coininfo.dogecoin.test

class dogeBasic extends btcBasic{
    network= () => {
        return dogecoin.toBitcoinJS()
    }
    getfeeRate =() => {
        return 0.1
    }
}

const doge = new dogeBasic('DOGE')

// 从命令行参数中获取充值地址和转账金额
const address = process.argv[2];
const transferAmount = parseFloat(process.argv[3]);

doge.sendBTC(address, transferAmount)