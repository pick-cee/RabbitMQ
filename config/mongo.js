const mongoose = require("mongoose")
require('dotenv').config()


module.exports = async function connect() {
    process.env.NODE_ENV === 'development' ?
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
            .then(() => { console.log(`Local DB Connected!`) })
            .catch((err) => { console.error(err) })
        : await mongoose.connect((process.env.MONGODB_URI_CLOUD))
            .then(() => `Cloud DB connected successfully`)
            .catch((err) => console.error(err))
}