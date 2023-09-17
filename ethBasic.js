const { ethers } = require('ethers');
const _ = require('lodash')
const BigNumber = require('bignumber.js');
const config = require('./configLoad');


class ethBasic{
    constructor(chain){
      this.localEthers = null
      this.config = config[chain]
    }
    async init(){
    }
  
    getEthers(){
      if(!this.localEthers){
        const keypair = this.config.KEYPAIR[0]
        const wallet = new ethers.Wallet(keypair.PRIKEY);
        const provider = new ethers.JsonRpcProvider(this.config.URL);
        this.localEthers = wallet.connect(provider);
      }
      return this.localEthers
    }
  
    async sendEth(address,amount) {
      // 发送ETH转账交易
      const connectedWallet = this.getEthers()
      const tx = await connectedWallet.sendTransaction({
        to: address,
        value: ethers.parseEther(amount.toString())
        
      });
      console.log(`Transfer ${amount} ETH to ${address}. Transaction Hash: ${tx.hash}`);
    }
  
    async sendErc20(token,address,amount) {
        const connectedWallet = this.getEthers()
        const abi = [
            "function balanceOf(address) view returns (uint)",
            "function transfer(address to, uint amount) returns (bool)",
            "function decimals() view returns (uint8)"
          ]
        // 实例化ERC20智能合约
        const tokenaddress = this.config[token]
        const contract = new ethers.Contract(tokenaddress, abi, connectedWallet);
        const decimals = await contract.decimals();
        // 执行ERC20智能合约转账
        const value = ethers.parseUnits(amount.toString(), decimals);
        const balance = await contract.balanceOf(connectedWallet.address);
        if (BigNumber(balance).lt(value)) {
          console.log(`Insufficient balance for transfer to ${address}`);
        }
        // 发送ERC20智能合约转账交易
        const tx = await contract.transfer(address, value);
        console.log(`Transfer ${amount} ${token} to ${address}. Transaction Hash: ${tx.hash}`);
    }
  
  }

  module.exports = ethBasic