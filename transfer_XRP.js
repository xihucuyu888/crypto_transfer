const config = require('./configLoad');
const xrpl = require("xrpl");
// 从命令行参数中获取充值地址和转账金额
const toAddress = process.argv[2];
const transferAmount = parseFloat(process.argv[3]);

// WebSocket
// wss://s.altnet.rippletest.net:51233/

// JSON-RPC
// https://s.altnet.rippletest.net:51234/

async function main() {

const xrpConfig = config["XRP"]
const keypair = xrpConfig.KEYPAIR[0]
const client = new xrpl.Client(xrpConfig.URL);
await client.connect();
const wallet = xrpl.Wallet.fromSecret(keypair.PRIKEY)
const prepared = await client.autofill({
  "TransactionType": "Payment",
  "Account": keypair.ADDRESS,
  "Amount": xrpl.xrpToDrops(transferAmount),
  "Destination": toAddress,
})

console.log(`perpare:${JSON.stringify(prepared)}`)
const signed = wallet.sign(prepared)
const tx = await client.submitAndWait(signed.tx_blob)
console.log(`result: ${JSON.stringify(tx)}`)
client.disconnect()
}

main().catch((err)=>console.log(err)).finally(()=>{})

