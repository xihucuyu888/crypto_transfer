const TronWeb = require('tronweb');
const config = require('./configLoad')

const RPC = config['TRX'].URL
const PRIKEY = config['TRX'].KEYPAIR[0].PRIKEY

const address = process.argv[2];
const amount = parseFloat(process.argv[3]);
const token = process.argv[4];

const TOKEN = config['TRX'][token]
const abi = [
    {"outputs":[{"type":"uint8"}],"name":"decimals","stateMutability":"View","type":"Function"},
    {"outputs":[{"type":"bool"}],"inputs":[{"name":"recipient","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","stateMutability":"Nonpayable","type":"Function"},
    {"outputs":[{"type":"uint256"}],"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","stateMutability":"View","type":"Function"}
  ]

// 创建TronWeb对象
const tronWeb = new TronWeb({
    fullHost: RPC,
    solidityNode:RPC,
    eventServer:RPC,
    privateKey: PRIKEY
  });

( async () => {
    const contract = await tronWeb.contract(abi, TOKEN);
    const decimal = await contract.decimals().call()
    const transactionId = await contract.transfer(address, amount * 10 ** decimal).send();
    console.log(`Transfer ${amount} ${token} to ${address}. Transaction Hash: ${transactionId}`);

})()