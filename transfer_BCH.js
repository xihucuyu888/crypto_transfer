const btcBasic = require('./btcBasic');
const BchJsLib = require('bitcore-lib-cash')
const BigNumber = require('bignumber.js');
const coinSelect = require('coinselect')
const bitcoin = require('bitcoinjs-lib')
const _ = require('lodash')

class bchBasic extends btcBasic{
    network= () => {
        return BchJsLib.Networks.testnet
    }

    genAddressByRandom = () =>{
        const pri = new BchJsLib.PrivateKey(BchJsLib.Networks.testnet)
        const wif = pri.toWIF()
        const address = pri.toAddress()
        console.log('Private Key:', pri.toString());
        console.log('wif:', wif);
        console.log('Address:', address.toString(BchJsLib.Networks.testnet));
    }

    async sendBCH(address,amount){
        const feePrice = await this.getfeeRate()
        const feeRate = new BigNumber(feePrice).times(1e8).dividedBy(100).integerValue(BigNumber.ROUND_DOWN).toNumber()
        const value = new BigNumber(amount).times(1e8).toNumber()
        const targets = [{
            address,
            value
        }]
        //const froms 
        const utxos = await this.getUtxos()
        const {inputs, outputs, fee} = coinSelect(utxos,targets,feeRate)
        const from = []
        const to = []
        if (inputs && outputs){
            //build tx
            const filledOutputs = outputs.map(output => {
                if (!output.address) {
                  output.address = inputs[0].address; // 在这里设置默认值
                }
                return output;
            })
            _.map(inputs, input => {
                const { address, txId, vout: outputIndex, satoshis, script} = input
                from.push({ address, txId, outputIndex, satoshis, script })
              })
            _.map(outputs, output => {
                const { address, value:satoshis } = output
                to.push({ address, satoshis })
            })
            const network = this.network()
            const tx = new BchJsLib.Transaction().from(from).to(to)

            //sign tx
            const froms = this.config.KEYPAIR
            let signer,priKey
            for (let i =0;i<inputs.length;i++){
                priKey = _.find(froms, function(o) { return o.ADDRESS == inputs[i].address})
                signer = BchJsLib.PrivateKey.fromWIF(priKey.PRIKEY, network)
                tx.sign(signer,i)
            }
            
            //send tx
            const rawtx = tx.toString()
            const hash = await this.sendTx(rawtx)
            console.log(`Transfer ${amount} BCH to ${address}. Transaction Hash: ${hash.txid}`);

        } else {
            console.log(inputs, outputs, fee)
            throw new Error('not enough utxos!!!')
        }

        

    }
}

const bch = new bchBasic('BCH')

//bch.genAddressByRandom()


// 从命令行参数中获取充值地址和转账金额
const address = process.argv[2];
const transferAmount = parseFloat(process.argv[3]);

bch.sendBCH(address, transferAmount)