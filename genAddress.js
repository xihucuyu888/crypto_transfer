const { cryptoWaitReady, randomAsHex } = require('@polkadot/util-crypto');
const { Keyring } = require('@polkadot/keyring');
const { hexToU8a } = require('@polkadot/util')

async function generatePrivateKeyAndAddress() {
  await cryptoWaitReady(); // 等待密码库准备就绪

  const privateKey = randomAsHex(32); // 生成一个 32 位的随机私钥（十六进制格式）
  const keyring = new Keyring({ type: 'ecdsa' });
  const pair = keyring.addFromSeed(hexToU8a(privateKey), undefined, 'ecdsa');

  console.log('Address:', pair.address);
  console.log('privateKey:', privateKey);
}

generatePrivateKeyAndAddress()