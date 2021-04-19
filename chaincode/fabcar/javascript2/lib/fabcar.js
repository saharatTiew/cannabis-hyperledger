/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar2 extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        // const packages = [
        //     {
        //         name: 'Big Package',
        //         description: 'Cannabis 100g, pure 100%',
        //         store: 'Cannabis Happy Store',
        //         location: '221B Burger Street'
        //     },
        //     {
        //         name: 'Medium Package',
        //         description: 'Description',
        //         store: 'Cannabis Happy Store',
        //         location: 'Asgard'
        //     },
        //     {
        //         name: 'Small Package',
        //         description: 'Description',
        //         store: 'Cannabis Happy Store',
        //         location: 'Wakanda'
        //     },
        //     {
        //         name: 'Mixed Package',
        //         description: 'Description',
        //         store: 'Cannabis Happy Store',
        //         location: 'Atlantis'
        //     }
        // ];

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

    async queryTransactions(ctx, transactionKey) {
        const transactionAsBytes = await ctx.stub.getState(transactionKey); // get the car from chaincode state
        if (!transactionAsBytes || transactionAsBytes.length === 0) {
            throw new Error(`${transactionKey} does not exist`);
        }
        console.log('transactions', transactionAsBytes.toString());
        return transactionAsBytes.toString();
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
}

module.exports = FabCar2;
