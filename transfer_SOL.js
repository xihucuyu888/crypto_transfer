const solweb3 = require("@solana/web3.js");
const config = require('./configLoad');

// // generate account
// let prikey = '22dcc6c6d49888e5302313bc21ba618cf9b9b6b26b3ba7821d22b15a87b42618'
// let seed = Uint8Array.from(Buffer.from(prikey,'hex'))
// console.log(seed)
// let keypairs = solweb3.Keypair.fromSeed(seed);
// // 2hiRdNrUNLtNhAqhv3qL95ccd3rYGyhfYt6zriGzi3LR
// console.log('PUB:',keypairs.publicKey.toString('hex'))

// //  generate account random
// let keypairs = solweb3.Keypair.generate()
// console.log('PRI:',Buffer.from(keypairs.secretKey).toString('hex'))
// console.log('PUB:',keypairs.publicKey.toString('hex'))

const address = process.argv[2];
const value = parseFloat(process.argv[3]);
const rate = 1e9
const valueNoDecimal = parseInt(rate * value)


let pri = config['SOL'].KEYPAIR[0].PRIKEY;
if (pri.startsWith("0x")) {
    pri = pri.substring(2);
  }
const seed = Uint8Array.from(Buffer.from(pri,'hex'))
let keypair = solweb3.Keypair.fromSeed(seed);

(async () => {
    let transaction = new solweb3.Transaction();
    transaction.add(
        solweb3.SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: address,
          lamports: valueNoDecimal,
        }),
      );
    let connection = new solweb3.Connection(solweb3.clusterApiUrl("devnet"));
    let tx = await solweb3.sendAndConfirmTransaction(connection, transaction, [keypair]);
    console.log(`Transfer ${value} SOL to ${address}. Transaction Hash: ${tx}`);
})()