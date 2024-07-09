const { JettonWallet, JettonMaster, TonClient, WalletContractV4, 
  internal,external, Address, beginCell, storeMessage, toNano} = require("ton");
const { mnemonicNew, mnemonicToPrivateKey } = require("ton-crypto");
const config = require('./configLoad')

const RPC = config['TON'].URL
const PRIKEY = config['TON'].KEYPAIR[0].PRIKEY
const PUBKEY = config['TON'].KEYPAIR[0].PUBKEY


const to = process.argv[2];
const value = parseFloat(process.argv[3]);
const token = process.argv[4];
const memo = 'Hello TON!!'


const usdtTokenContractAddress = config['TON'][token]

// Create Client
const client = new TonClient({
  endpoint: RPC,
});

async function getUserJettonWalletAddress(userAddress, jettonMasterAddress) {
  const userAddressCell = beginCell().storeAddress(Address.parse(userAddress)).endCell();

  const response = await client.runMethod(Address.parse(jettonMasterAddress), 'get_wallet_address', [
    { type: 'slice', cell: userAddressCell },
  ]);

  return response.stack.readAddress();
}

( async() => {
    // // Generate new key
    // let mnemonics = await mnemonicNew();
    // let keyPair = await mnemonicToPrivateKey(mnemonics);
    // console.log('secretKey:',keyPair.secretKey.toString('hex'))
    // console.log('publicKey:',keyPair.publicKey.toString('hex'))

    // Create wallet contract
    const publicKey = Buffer.from(PUBKEY,'hex')
    const secretKey = Buffer.from(PRIKEY,'hex')
    const workchain = 0; // Usually you need a workchain 0
    const wallet = WalletContractV4.create({ workchain, publicKey});
    const contract = client.open(wallet);
    const address = wallet.address.toString({bounceable: false, testOnly: true })
    
    const balance = await contract.getBalance();
    console.log({ address, balance });

    const seqno = await contract.getSeqno();
    console.log({ address, seqno });

    const { init } = contract;
    const contractDeployed = await client.isContractDeployed(Address.parse(address));
    
    let neededInit
    if (init && !contractDeployed) {
      neededInit = init;
    }

    const jettonWalletAddress = await getUserJettonWalletAddress(address, usdtTokenContractAddress);
    const toAddress = Address.parse((await getUserJettonWalletAddress(to, usdtTokenContractAddress)).toString())
    const fromAddress =  Address.parse(jettonWalletAddress.toString())
    const amount = value * 1e9

    // Comment payload
    const forwardPayload = beginCell()
      .storeUint(0, 32) // 0 opcode means we have a comment
      .storeStringTail(memo)
      .endCell();


    const messageBody = beginCell()
      .storeUint(0x0f8a7ea5, 32) // opcode for jetton transfer
      .storeUint(0, 64) // query id
      .storeCoins(amount) // jetton amount, amount * 10^9
      .storeAddress(toAddress)
      .storeAddress(fromAddress) // response destination
      .storeBit(0) // no custom payload
      .storeCoins(toNano('0.02')) // forward amount - if > 0, will send notification message
      .storeBit(1) // we store forwardPayload as a reference, set 1 and uncomment next line for have a comment
      .storeRef(forwardPayload)
      .endCell();

    const internalMessage = internal({
      to: jettonWalletAddress,
      value: toNano('0.1'),
      bounce: true,
      body: messageBody,
    });


    const body = wallet.createTransfer({
      seqno,
      secretKey,
      messages: [internalMessage],
  });

  const externalMessage = external({
    to: address,
    init: neededInit,
    body,
  });

  const externalMessageCell = beginCell().store(storeMessage(externalMessage)).endCell();

  const signedTransaction = externalMessageCell.toBoc();
  const hash = externalMessageCell.hash().toString('hex');

  console.log('hash:', hash);

  await client.sendFile(signedTransaction);


})()



