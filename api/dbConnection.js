const mongoose = require('mongoose')
mongoose.Promise = global.Promise

// DB
const connection = (url) =>
    mongoose.connect(url, { useMongoClient: true })
        .then(dbConn => {
            console.log('[dbConnection] MONGOOSE CONNECTED')
            return dbConn
        }
        )

module.exports = connection
