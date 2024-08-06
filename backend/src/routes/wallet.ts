import express from "express"
import Web3 from "web3";
import dotenv from "dotenv"
 export const walletRouter  = express.Router()

 dotenv.config();

 const web3 = new Web3(`https://sepolia.infura.io/v3/${process.env.API_KEY}`)


walletRouter.post('/create', (req, res) => {
    const account = web3.eth.accounts.create();
    return res.status(200).json({
        address: account.address,
        privateKey: account.privateKey 
    })
});

walletRouter.post('/send', async(req, res) => {
    const { fromAddress, toAddress, amount, privateKey } = req.body;

    try {
        const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest');
        const gasPrice = BigInt(await web3.eth.getGasPrice());
        const gasLimit = BigInt(21000); // Assuming 21000 => sufficient for transaction
        // maximum required
        const maxPriorityFeePerGas = BigInt(web3.utils.toWei('0.0001', 'gwei'));
        const maxFeePerGas = gasPrice + maxPriorityFeePerGas;

        // gas cost calculation
        const gasCost = gasPrice * gasLimit;
        const gasCostEther = parseFloat(web3.utils.fromWei(gasCost.toString(), 'ether'));
        const amountEther = parseFloat(amount);
        const totalRequired = amountEther + gasCostEther;

        // balance 
        const balanceWei = BigInt(await web3.eth.getBalance(fromAddress));
        const balanceEther = parseFloat(web3.utils.fromWei(balanceWei.toString(), 'ether'));

        if (balanceEther < totalRequired) {
            return res.status(400).json({ error: "Insufficient funds for gas * price + value" });
        }

        const transaction = {
            'to': toAddress,
            'value': web3.utils.toWei(amount.toString(), 'ether'),
            'gas': gasLimit.toString(),
            'maxFeePerGas': maxFeePerGas.toString(),
            'maxPriorityFeePerGas': maxPriorityFeePerGas.toString(),
            'nonce': nonce,
            'type': 2
        } 

        const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
        console.log(signedTransaction);
        const receit = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction as string)
        res.status(200).json({receit})
    } catch(e) {
        console.log(e);
    }
});

walletRouter.get('/balances/:address', async(req, res) => {
    const address = req.params.address;
    try {
        const balance = await web3.eth.getBalance(address);
        const result = web3.utils.fromWei(balance, 'ether');
        const finalRes = Number(result).toFixed(5)
        res.status(200).json({message: finalRes});
    } catch(e) {
        console.log(e);
    }
})


// 0x9713BBa34E188c649efd63CC029CF634A44E1CeB
