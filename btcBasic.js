const _ = require('lodash')
const bitcoin = require('bitcoinjs-lib');
const BigNumber = require('bignumber.js');
const coinSelect = require('coinselect')
const axios = require('axios')
const config = require('./configLoad');

const utxoMapper = (utxos) => {
    utxos = utxos.map(utxo => {
      const out = {}
      const amount = new BigNumber(utxo.value).div(1e8).toNumber()
      _.set(out, 'address', utxo.address)
      _.set(out, 'txid', utxo.mintTxid)
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
        return utxoMapper(result)
    }

    getfeeRate = async() => {
        const result = await this.get('/fee/2')
        return result.feerate
    }

    

    async sendBTC(address,amount){
        const feeRate = (await this.getfeeRate())* 1e8
        const targets = [{
            address,
            value: amount*1e8
        }]
        //const froms 
        const utxos = getAddressUtxo()
        const {inputs, outputs, fee} = coinSelect(utxos,targets,feeRate)

    }
}