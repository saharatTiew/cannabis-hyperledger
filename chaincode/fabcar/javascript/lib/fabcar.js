/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
    
        const packages = [
            {
                name: 'Big Package',
                weight: 100,
                quality: 100.00,
                store: 'Cannabis Happy Store',
                location: '221B Burger Street'
            },
            {
                name: 'Medium Package',
                weight: 90,
                quality: 95.00,
                description: 'Description',
                store: 'Cannabis Happy Store',
                location: 'Asgard'
            },
            {
                name: 'Small Package',
                weight: 60,
                quality: 99.00,
                description: 'Description',
                store: 'Cannabis Happy Store',
                location: 'Wakanda'
            },
            {
                name: 'Mixed Package',
                weight: 95,
                quality: 93.00,
                description: 'Description',
                store: 'Cannabis Happy Store',
                location: 'Atlantis'
            }
        ];
        
        for (let i = 0; i < packages.length; i++) {
            // packages[i].docType = 'packages';
            console.log(packages[i]);
            await ctx.stub.putState('PACKAGES' + '00' +i, Buffer.from(JSON.stringify(packages[i])));
            console.info('Added <--> ', packages[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryCar(ctx, carNumber) {
        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        console.log(carAsBytes.toString());
        return carAsBytes.toString();
    }

    async createCar(ctx, carNumber, make, model, color, owner) {
        console.info('============= START : Create Car ===========');
        console.log('car');
        const car = {
            color,
            docType: 'car',
            make,
            model,
            owner,
        };

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Create Car ===========');
    }

    async queryAllCars(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async changeCarOwner(ctx, carNumber, newOwner) {
        console.info('============= START : changeCarOwner ===========');

        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.owner = newOwner;

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : changeCarOwner ===========');
    }

    async queryTransactions(ctx, transactionKey) {
        const transactionAsBytes = await ctx.stub.getState(transactionKey); // get the car from chaincode state
        if (!transactionAsBytes || transactionAsBytes.length === 0) {
            throw new Error(`${transactionKey} does not exist`);
        }
        console.log('transactions', transactionAsBytes.toString());
        return transactionAsBytes.toString();
    }

    async createTransactions(ctx, customerName, customerAddress, packageId, dateTime, dateUnix) {
        console.info('============= START : Create Car ===========');
        console.log('packageId : ', packageId);
        const packages = JSON.parse(await this.queryPackage(ctx, packageId));
        console.log(packages);

        const date = dateTime;
        const transaction = {
            customerName,
            // docType: 'cannabis',
            customerAddress,
            packages,
            // productQuality,
            // packageId,
            transaction: 
            [
                {
                    fromName: packages.store,
                    fromLocation: packages.location,
                    timestamp: dateTime,
                    receiverName: 'North Warehouse',
                    receiverAddress: 'Unsuspicious House'
                }
            ]
        };
        const key = `${customerName}-${dateUnix}`
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(transaction)));
        console.info('============= END : Create Car ===========');
    }

    async arriveAtWarehouse(ctx, transactionKey, dateTime)
    {
        console.info('============= START : START UPDATE AT WAREHOUSE ===========');
        const transactions = JSON.parse(await this.queryTransactions(ctx, transactionKey));
        console.log('transactionsObject', transactions);

        const warehouse = 
        {
            fromName: transactions.transaction[0].receiverName,
            fromLocation: transactions.transaction[0].receiverAddress,
            timestamp: dateTime,
            receiverName: transactions.customerName,
            receiverAddress: transactions.customerAddress
        }
        transactions.transaction.push(warehouse);
        await ctx.stub.putState(transactionKey, Buffer.from(JSON.stringify(transactions)));
        console.info('============= END : UPDATE AT WAREHOUSE ===========');
    }

    async arriveAtCustomer(ctx, transactionKey, dateTime)
    {
        console.info('============= START : START UPDATE AT Customer ===========');
        const transactions = JSON.parse(await this.queryTransactions(ctx, transactionKey));
        console.log('transactionsObject', transactions);

        const customers = 
        {
            fromName: transactions.customerName,
            fromLocation: transactions.customerName,
            timestamp: dateTime,
            receiverName: "",
            receiverAddress: ""
        }
        transactions.transaction.push(customers);
        await ctx.stub.putState(transactionKey, Buffer.from(JSON.stringify(transactions)));
        console.info('============= END : UPDATE AT Customer ===========');
    }

    async queryPackage(ctx, packageId) {
        const packageAsBytes = await ctx.stub.getState(packageId); // get the car from chaincode state
        if (!packageAsBytes || packageAsBytes.length === 0) {
            throw new Error(`${packageId} does not exist`);
        }
        console.log(packageAsBytes.toString());
        return packageAsBytes.toString();
    }

    async queryAllTransactions(ctx, userName) {
        const startKey = `${userName}-`;
        const endKey = `${userName}.`;
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        // console.info(JSON.stringify(allResults));
        return JSON.stringify(allResults);
    }

    async queryAllPackages(ctx) {
        const startKey = 'PACKAGES000';
        const endKey = 'PACKAGES100';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        return JSON.stringify(allResults);
    }
}

module.exports = FabCar;
