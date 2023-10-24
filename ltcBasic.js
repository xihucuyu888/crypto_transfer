const _ = require('lodash')
const btcBasic = require('./btcBasic');
const litecore = require('bitcore-lib-ltc')
const BigNumber = require('bignumber.js');
const coinSelect = require('coinselect')
const axios = require('axios')
const config = require('./configLoad');


class ltcBasic extends btcBasic{

    async sendLTC(address,amount){
        const feePrice = await this.getfeeRate()
        const feeRate = new BigNumber(feePrice).times(1e8).dividedBy(100).intergerValue(BigNumber.ROUND_DOWN).toNumber()
        const value = new BigNumber(amount).times(1e8).toNumber()
        const targets = [{
            address,
            value
        }]
        //const froms 
        const utxos = await this.getUtxos()
        const {inputs, outputs, fee} = coinSelect(utxos,targets,feeRate)
        if (inputs && outputs){
            //build tx
            const filledOutputs = outputs.map(output => {
                if (!output.address) {
                  output.address = inputs[0].address; // 在这里设置默认值
                }
                return output;
            })
            const network = litecore.Networks.testnet
            const tx = new litecore.Transaction(network)
            tx.from(inputs)
            filledOutputs.forEach((e)=>tx.to(e.address,e.value))

            //sign tx
            const froms = this.config.KEYPAIR
            let signer,priKey
            for (let i =0;i<inputs.length;i++){
                priKey = _.find(froms, function(o) { return o.ADDRESS == inputs[i].address})
                signer = new litecore.PrivateKey(priKey.PRIKEY,network)
                tx.sign(signer)
            }
            
            //send tx
            const rawtx = tx.uncheckedSerialize()
            const hash = await this.sendTx(rawtx)
            console.log(`Transfer ${amount} BTC to ${address}. Transaction Hash: ${hash.txid}`);

        } else {
            throw new Error('not enough utxos!!!')
        }

    }
}

module.exports = ltcBasic
