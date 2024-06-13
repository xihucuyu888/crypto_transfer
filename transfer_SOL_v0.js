const solweb3 = require("@solana/web3.js");
const config = require('./configLoad');

const address = process.argv[2];
const value = parseFloat(process.argv[3]);
const rate = 1e9
const valueNoDecimal = parseInt(rate * value)


let pri = config['SOL'].KEYPAIR[0].PRIKEY;
if (pri.startsWith("0x")) {
    pri = pri.substring(2);
}
const seed = Uint8Array.from(Buffer.from(pri, 'hex'))
let keypair = solweb3.Keypair.fromSeed(seed);

(async () => {
    const instructions = [
        solweb3.SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: new solweb3.PublicKey(address),
            lamports: valueNoDecimal,
        }),
    ];

    let connection = new solweb3.Connection(solweb3.clusterApiUrl("devnet"));
    let blockhash = await connection
        .getLatestBlockhash()
        .then(res => res.blockhash);

    const messageV0 = new solweb3.TransactionMessage({
        payerKey: keypair.publicKey,
        recentBlockhash: blockhash,
        instructions,
    }).compileToV0Message();
    const transaction = new solweb3.VersionedTransaction(messageV0);
    transaction.sign([keypair]);

    let tx = await connection.sendTransaction(transaction);
    await connection.confirmTransaction({signature: tx});
    console.log(`Transfer ${value} SOL to ${address}. Transaction Hash: ${tx}`);
})()