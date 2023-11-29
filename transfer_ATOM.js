// https://tutorials.cosmos.network/tutorials/7-cosmjs/2-first-steps.html

const BigNumber = require('bignumber.js');
const { DirectSecp256k1Wallet } = require("@cosmjs/proto-signing");
const { SigningStargateClient, calculateFee, GasPrice } = require("@cosmjs/stargate");
const { hexToU8a } = require('./util');
const config = require('./configLoad');

const address = process.argv[2];
const transferAmount = parseFloat(process.argv[3]);

(async () => {
    const keypair = config['ATOM'].KEYPAIR[0];
    const wallet = await DirectSecp256k1Wallet.fromKey(hexToU8a(keypair.PRIKEY));
    const [mAccount] = await wallet.getAccounts();

    const rpcEndpoint = config['ATOM'].URL;
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);

    const amount = {
        denom: "uatom",
        amount: new BigNumber(transferAmount).times(1e6).toNumber().toString(),
    };

    const defaultGasPrice = GasPrice.fromString('0.01uatom');
    const defaultSendFee = calculateFee(200_000, defaultGasPrice);

    const result = await client.sendTokens(mAccount.address, address, [amount], defaultSendFee);
    console.log(`Transfer ${transferAmount} ATOM to ${address}. Transaction Hash: ${result.transactionHash}`);
})();