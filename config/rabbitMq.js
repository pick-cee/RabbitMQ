const amqp = require('amqplib/callback_api')

function setupRabbitMQ() {
    amqp.connect('amqp://localhost', (error, connection) => {
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

            console.log(`Connected to RabbitMQ Queue: ${queue}`)
        })
    })
}

async function addToQueue(action, data) {
    amqp.connect('amqp://localhost', (error, connection) => {
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

            channel.sendToQueue(queue, Buffer.from(JSON.stringify({ action, data })))
            console.log(`Added action "${action}" to the RabbitMQ queue.`);
        })
    })
}

module.exports = { setupRabbitMQ, addToQueue }