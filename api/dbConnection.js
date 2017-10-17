const mongoose = require('mongoose')
// DB
const connection = (url) =>
    mongoose.connect(url, { useMongoClient: true })
        .then(dbConn => {
            console.log('MONGOOSE CONNECTED')
            return dbConn
        }
        )

module.exports = connection
