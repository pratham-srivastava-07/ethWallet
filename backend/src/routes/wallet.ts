import express from "express"
import Web3 from "web3";

 export const walletRouter  = express.Router()

 const web3 = new Web3('https://sepolia.infura.io/v3/3c01b1ae45eb4e04865437dffbeb95dc')


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
        const gasPrice = await web3.eth.getGasPrice();

        const transaction = {
            'to': toAddress,
            'value': web3.utils.toWei(amount.toString(), 'ether'),
            'gas': 2000000,
            'gasPrice': gasPrice,
            'nonce': nonce
        } 

        const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
        // console.log(signedTransaction);
        const receit = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction as string)
        res.status(200).json({receit})
    } catch(e) {
        console.log(e);
    }
});

walletRouter.post('/balances/:address', async(req, res) => {
    const address = req.params.address;
    try {
        const balance = await web3.eth.getBalance(address);
        const result = web3.utils.fromWei(balance, 'ether');
        res.status(200).json({message: result});
    } catch(e) {
        console.log(e);
    }
})


// 0x9713BBa34E188c649efd63CC029CF634A44E1CeB
// 0xaeb8244a8f5b8b040ecc7773272b743d4d7bd4ad559bfc10cf5ea0b0d42ce22b