const { Aptos, AptosConfig, Network, Account,Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");
const config = require('./configLoad');

// with custom configuration
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

//// generate account
// const account = Account.generate(); 
// console.log('PRI:',account.privateKey.toString('hex'))
// console.log('ADDR:',account.accountAddress.toString('hex'))

// const address = process.argv[2];
// const value = parseFloat(process.argv[3]);
// const rate = 1e8
// const valueNoDecimal = parseInt(rate * value)


let pri = config['APTOS'].KEYPAIR[0].PRIKEY;
if (pri.startsWith("0x")) {
  pri = pri.substring(2);
}
const byteArray = new Buffer.from(pri,'hex');
const privateKey = new Ed25519PrivateKey(byteArray);

const from = Account.fromPrivateKey({privateKey});
const address = '0x686a622a2fe677fae04a2cde070bdad88a0a19cff4f4a23574a435a980623f2f';


(async () => {

  // const transaction = await aptos.transaction.build.simple({
  //   sender: from.accountAddress,
  //   data: {
  //     function: "0x1::coin::transfer",
  //     typeArguments: ["0x1::aptos_coin::AptosCoin"],
  //     functionArguments: [address, 20000],
  //   },
  // });

  //   const transaction = await aptos.transaction.build.simple({
  //   sender: from.accountAddress,
  //   data: {
  //     function: "0x1::aptos_account::transfer",
  //     typeArguments: [],
  //     functionArguments: [address, 20000],
  //   },
  // });

  // const transaction = await aptos.transaction.build.simple({
  //   sender: from.accountAddress,
  //   data: {
  //     function: "0x1::aptos_account::batch_transfer",
  //     typeArguments:[],
  //     functionArguments: [[address,address], [3000000,200000]],
  //   },
  // });

  //   const transaction = await aptos.transaction.build.simple({
  //   sender: from.accountAddress,
  //   data: {
  //     function: "0x1::aptos_account::transfer_coins",
  //     typeArguments:["0x1::aptos_coin::AptosCoin"],
  //     functionArguments: [address,1000000],
  //   },
  // });

    const transaction = await aptos.transaction.build.simple({
    sender: from.accountAddress,
    data: {
      function: "0x1::aptos_account::batch_transfer_coins",
      typeArguments:["0x1::aptos_coin::AptosCoin"],
      functionArguments: [[address,address], [3000000,200000]],
    },
  });

  //   const transaction = await aptos.transaction.build.simple({
  //   sender: from.accountAddress,
  //   data: {
  //     function: "0x1::aptos_account::transfer_coins",
  //     typeArguments:["0x718e7f84b82b0648b92b59f986feb6865f56d7f2ca7a2702aff08e8340ac6dd5::moon_coin::MoonCoin"],
  //     functionArguments: [address, 20000],
  //   },
  // });
  
  const pendingTransaction = await aptos.signAndSubmitTransaction({
    signer: from,
    transaction,
  });

  console.log(`Transfer  APTOS to ${address}. Transaction Hash: ${pendingTransaction.hash}`);
  
})()



