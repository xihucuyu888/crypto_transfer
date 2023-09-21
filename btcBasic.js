const _ = require('lodash')
const bitcoin = require('bitcoinjs-lib');
const BigNumber = require('bignumber.js');
const coinSelect = require('coinselect')
const axios = require('axios')
const config = require('./configLoad');

class btcBasic{
    constructor(chain){
        this.config = config[chain]
      }
    
    get = async (url) => {
        return (await axios.get(this.config.URL + url)).data
    }
      
    post = async (url, data) => {
        return (await axios.post(this.config.URL + url, data)).data
    }

    getAddressUtxo = async (address) => {
        const result = await this.get(`/address/${address}?unspent=true&limit=1000`)
        return this.utxoMapper(result)
    }

    utxoMapper = (utxos) => {
        utxos = utxos.map(utxo => {
          const out = {}
          const amount = new BigNumber(utxo.value).div(1e8).toNumber()
          _.set(out, 'address', utxo.address)
          _.set(out, 'txid', utxo.mintTxid)
          _.set(out, 'txId', utxo.mintTxid)
          _.set(out, 'vout', utxo.mintIndex)
          _.set(out, 'scriptPubKey', utxo.script)
          _.set(out, 'amount', amount)
          _.set(out, 'satoshis', utxo.value)
          _.set(out, 'height', utxo.mintHeight)
          _.set(out, 'confirmations', utxo.confirmations)
          return _.assign(utxo, out)
        })
        return utxos
      }

    getfeeRate = async() => {
        const result = await this.get('/fee/2')
        return result.feerate
    }

    sendTx = async(rawtx) =>{
        let result
        try {
            result = await this.post('/tx/send', { rawTx: rawtx })
        } catch (err) {
            console.log(err)
            throw new Error('broadcast tx failed ')}
        return result
    }

    async getUtxos() {
        const froms = _.map(this.config.KEYPAIR,'ADDRESS')
        const utxoSet = new Set();

        for (const address of froms) {
        const utxos = await this.getAddressUtxo(address)
        utxos.forEach(utxo => {
            utxoSet.add(JSON.stringify(utxo))
            });
        }
        const uniqueUTXOs = Array.from(utxoSet).map(utxoString => JSON.parse(utxoString))
        return uniqueUTXOs
    }

    

    async sendBTC(address,amount){
        const feePrice = await this.getfeeRate()
        const feeRate = new BigNumber(feePrice).times(1e8).toNumber()
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
            const network = bitcoin.networks.testnet
            const tx = new bitcoin.TransactionBuilder(network)
            inputs.forEach((e)=>tx.addInput(e.txid,e.vout))
            filledOutputs.forEach((e)=>tx.addOutput(e.address,e.value))

            //sign tx
            const froms = this.config.KEYPAIR
            let signer,priKey
            for (let i =0;i<inputs.length;i++){
                priKey = _.find(froms, function(o) { return o.ADDRESS == inputs[i].address})
                signer = bitcoin.ECPair.fromWIF(priKey.PRIKEY, network)
                tx.sign(i,signer)
            }
            
            //send tx
            const rawtx = tx.build().toHex()
            const hash = await this.sendTx(rawtx)
            console.log(`Transfer ${amount} BTC to ${address}. Transaction Hash: ${hash.txid}`);

        } else {
            throw new Error('not enough utxos!!!')
        }

        

    }
}

module.exports = btcBasic
