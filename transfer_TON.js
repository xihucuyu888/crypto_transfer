const { TonClient, WalletContractV4, internal } = require("ton");
const { mnemonicNew, mnemonicToPrivateKey } = require("ton-crypto");
const config = require('./configLoad')

const RPC = config['TON'].URL
const PRIKEY = config['TON'].KEYPAIR[0].PRIKEY
const PUBKEY = config['TON'].KEYPAIR[0].PUBKEY

const address = process.argv[2];
const value = parseFloat(process.argv[3]);

// Create Client
const client = new TonClient({
  endpoint: RPC,
});



( async() => {
    // // Generate new key
    // let mnemonics = await mnemonicNew();
    // let keyPair = await mnemonicToPrivateKey(mnemonics);
    // console.log('secretKey:',keyPair.secretKey.toString('hex'))
    // console.log('publicKey:',keyPair.publicKey.toString('hex'))

    // Create wallet contract
    const publicKey = Buffer.from(PUBKEY,'hex')
    const secretKey = Buffer.from(PRIKEY,'hex')
    let workchain = 0; // Usually you need a workchain 0
    let wallet = WalletContractV4.create({ workchain, publicKey});
    let contract = client.open(wallet);
    //gen memo
    timestamp = Date.now()
    memo = 'jptest:' + timestamp
    console.log(memo)

    // Create a transfer
    let seqno = await contract.getSeqno();
    let transfer = contract.createTransfer({
    seqno,
    secretKey,
    messages: [internal({
        value: ''+ value,
        to: address,
        body: memo
    })]
    });
    const res = await contract.send(transfer)
    console.log(`Transfer ${value} TON to ${address}. Action Memo: ${memo}`);

})()



