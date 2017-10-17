'use strict'
require('dotenv').config()
const throwReq = (setting) => { throw new Error(setting + "is required. Not found in process.env: " + process.env) }
const reqEnvVar = (...envVars) => {
    const env = {}
    envVars.forEach(envVar => { env[envVar] = process.env[envVar] || throwReq(envVar) })
    return env
}
// first we import our dependencies…
const express = require('express')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const bodyParser = require('body-parser')
// and create our instances
const app = express()
const router = express.Router()
// set our port to either a predetermined port number if you have set
// it up, or 3001
const env = reqEnvVar("API_PORT", "PATH_SETTINGS", "PATH_DEFAULT_SETTINGS", "URL_DB")


const dbConnector = require('./dbConnection')
const consumptionApi = require('./routes/consumptionApi')
const priceApi = require('./routes/priceApi')
const settingsApi = require('./routes/settingsApi')
const { testInsertions } = require('./testInsertions')

// now we should configure the API to use bodyParser and look for
// JSON data in the request body
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}))
app.use(bodyParser.json())
// To prevent errors from Cross Origin Resource Sharing, we will set
// our headers to allow CORS with middleware like so:
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers')
    // and remove cacheing so we get the most recent comments
    res.setHeader('Cache-Control', 'no-cache')
    // allow us to use hasOwnProperty on req.body
    Object.setPrototypeOf(req.body, {})
    next()
})
// now we can set the route path & initialize the API
router.get('/', (req, res) => {
    res.json({ message: 'API Initialized!' })
})
// Use our router configuration when we call /api
app.use('/api', router)
router.get('/', (req, res) => {
    res.json({ message: 'API Initialized!' })
})

consumptionApi(router)
priceApi(router)
settingsApi(router, env.PATH_SETTINGS, env.PATH_DEFAULT_SETTINGS)
// starts the server and listens for requests
dbConnector(env.URL_DB)
    .then((success) => {
        app.listen(env.API_PORT, () => {
            console.log(`api running on port ${env.API_PORT}`)
            console.log(`environnement: ${JSON.stringify(env, null, 2)}`)
            testInsertions('http://localhost:3001/api')
        })
    })
