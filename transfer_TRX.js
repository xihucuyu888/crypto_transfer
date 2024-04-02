const TronWeb = require('tronweb');
const config = require('./configLoad')

const RPC = config['TRX'].URL
const PRIKEY = config['TRX'].KEYPAIR[0].PRIKEY

const address = process.argv[2];
const amount = parseFloat(process.argv[3]);

// 创建TronWeb对象
const tronWeb = new TronWeb({
    fullHost: RPC,
    privateKey: PRIKEY
  });

( async () => {
    const transaction = await tronWeb.transactionBuilder.sendTrx(address, amount * 1e6, tronWeb.defaultAddress.hex);
    const signedTransaction = await tronWeb.trx.sign(transaction, PRIKEY);
    const transactionId = await tronWeb.trx.sendRawTransaction(signedTransaction);
    console.log(`Transfer ${amount} TRX to ${address}. Transaction Hash: ${transactionId.txid}`);

})()