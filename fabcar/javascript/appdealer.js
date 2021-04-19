'use strict';
const express = require('express')
const app = express()
const port = 3000

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

app.use(express.json());

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser2');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser2', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('channel2');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');
        
        // app.get('/packages', async (req, res) => {
        //     const result = await contract.evaluateTransaction('queryAllPackages');
        //     res.json(JSON.parse(result.toString()));
        // })

        app.get('/histories', async (req, res) => {
            let username = req.query.username;
            console.log(username);
            const result = await contract.evaluateTransaction('queryAllTransactions', username);
            res.json(JSON.parse(result.toString()));
        })

        app.get('/arrive-warehouse', async (req, res) => {
            let transactionKey = req.query.transactionkey;
            let date = new Date().toISOString();
            await contract.submitTransaction('arriveAtWarehouse', transactionKey , date);
            res.json({status : 'ok'});
        })

        app.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`)
        })
        // await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();






