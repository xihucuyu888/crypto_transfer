const { Aptos, AptosConfig, Network, Account,Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");
const config = require('./configLoad');

// with custom configuration
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

//// generate account
// const account = Account.generate(); 
// console.log('PRI:',account.privateKey.toString('hex'))
// console.log('ADDR:',account.accountAddress.toString('hex'))

const address = process.argv[2];
const value = parseFloat(process.argv[3]);
const rate = 1e8
const valueNoDecimal = parseInt(rate * value)


let pri = config['APTOS'].KEYPAIR[0].PRIKEY;
if (pri.startsWith("0x")) {
  pri = pri.substring(2);
}
const byteArray = new Buffer.from(pri,'hex');
const privateKey = new Ed25519PrivateKey(byteArray);

const from = Account.fromPrivateKey({privateKey});


(async () => {

  const transaction = await aptos.transferCoinTransaction({
    sender: from.accountAddress,
    recipient: address,
    amount: valueNoDecimal,
  });
  
  const pendingTransaction = await aptos.signAndSubmitTransaction({
    signer: from,
    transaction,
  });

  console.log(`Transfer ${value} APTOS to ${address}. Transaction Hash: ${pendingTransaction.hash}`);
  
})()



