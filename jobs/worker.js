const amqp = require('amqplib/callback_api')
const { createWallet, deleteWallet } = require('../controller/wallet.controller')
const walletModel = require('../models/wallet.model')
const connect = require('../config/mongo')
const mongoose = require("mongoose")


amqp.connect('amqp://localhost', async (error, connection) => {
    await connect()
    if (error) {
        console.error(error)
    }
    connection.createChannel((err, channel) => {
        if (err) {
            console.error(err)
        }
        const queue = 'First-Queue'

        channel.assertQueue(queue, {
            durable: false
        })

        console.log(`Worker is waiting for tasks in the "${queue}" queue.`);

        channel.consume(queue, async (message) => {
            const { action, data } = JSON.parse(message.content.toString())

            if (action === "user-created") {
                console.log(data);
                try {
                    const objectId = new mongoose.Types.ObjectId(data.userId);
                    await createWallet(objectId)
                    console.log(`Wallet created for user ${data.userId}`)
                }
                catch (err) {
                    console.log(err)
                }
            }

            else if (action === "user-deleted") {
                try {
                    const objectId = new mongoose.Types.ObjectId(data.userId);
                    await deleteWallet(objectId)
                    console.log(`Wallet deleted for user`)
                }
                catch (err) {
                    console.log(err)
                }
            }

            channel.ack(message)
        })

    })
})