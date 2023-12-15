const BigNumber = require('bignumber.js');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { hexToU8a } = require('@polkadot/util')
const config = require('./configLoad');

const address = process.argv[2];
const transferAmount = parseFloat(process.argv[3]);

(async () => {
    const rpcEndpoint = config['DOT'].URL;
    const keypair = config['DOT'].KEYPAIR[0];

    const api = await ApiPromise.create({ provider: new WsProvider(rpcEndpoint) });

    const chainInfo = await api.registry.getChainProperties();
    const decimals = 10
    const tokenSymbol = chainInfo.tokenSymbol.toJSON()[0];

    const keyring = new Keyring({ type: 'ecdsa' });
    const pair = keyring.addFromSeed(hexToU8a(keypair.PRIKEY), undefined, 'ecdsa');

    const transfer = api.tx.balances.transferKeepAlive(address, new BigNumber(transferAmount).times(10**decimals).toFixed(0));

    const hash = await transfer.signAndSend(pair);

    console.log(`Transfer ${transferAmount} ${tokenSymbol} to ${address}. Transaction Hash: ${hash.toHex()}`);

    await api.disconnect();
})();