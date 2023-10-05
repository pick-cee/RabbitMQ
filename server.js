const express = require("express")
const cors = require("cors")
const connect = require('./config/mongo')
const { setupRabbitMQ } = require('./config/rabbitMq')
const userRoutes = require('./routes/user.route')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const port = process.env.PORT
const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.get('/', (request, response) => {
    response.json({ message: 'Welcome!' })
})

app.use('/api/v1', userRoutes)


app.listen(port, async () => {
    await connect()
    await setupRabbitMQ()
    console.log(`Server listening on ${port}`)
})