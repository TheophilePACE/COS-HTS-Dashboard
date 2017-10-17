'use strict'
let Consumption = require('../model/consumptionModel')

const consumptionApi = (router) =>
    // adding the /consumption route to our /api router
    router.route('/consumptions')
        // retrieve all conumsption from the database
        .get((req, res) => {
            // looks at our Comment Schema


            console.log(req.url)
            const researchParam = { time: req.query.time, applianceId: req.query.applianceId, quantity: req.query.quantity }
            Object.keys(researchParam).forEach(key => { if (typeof researchParam[key] === 'undefined') delete researchParam[key] })
            Consumption.find(researchParam)
                .then((err, consumptions) => {
                    if (err) {
                        res.send(err)
                    } else {
                        // responds with a json object of our database consumptions.
                        res.json(consumptions)
                    }
                }).catch(err => {
                    console.log("[COnsumption API-get] problem with the request:")
                    console.log(err)
                    res.send(err)
                })
        })
        // post new comment to the database
        .post((req, res) => {
            if (!
                (req.body.hasOwnProperty('applianceId')
                    && req.body.hasOwnProperty('quantity')
                    && req.body.hasOwnProperty('time'))
            ) {
                res.json({ message: 'Body empty  or not complete', body: req.body })
                console.log('[consumptionApi-Post]insertion impossible body uncomplete :' + JSON.stringify(req.body))
            } else {
                const consumption = new Consumption()
                // body parser lets us use the req.body
                consumption.applianceId = req.body.applianceId
                consumption.quantity = req.body.quantity
                consumption.time = req.body.time

                consumption.save((err) => {
                    if (err) {
                        res.send(err)
                    }
                    res.json({ message: 'consumption successfully added!' })
                })
            }
        })
        .delete((req, res) => {
            let rm
            if (req.body.all) {
                rm = Consumption.remove({})
            } else {
                const body = {}
                body.applianceId = req.body.applianceId
                body.quantity = req.body.quantity
                body.time = req.body.time
                rm = Consumption.remove(body)
            }
            rm.then(result => {
                console.log('[delete consumption]: ' + JSON.stringify(req.body) + ' ==> ' + result)
                res.json({ result })
            })
        })
        .put((req, res) => {
            if (!
                (req.body.hasOwnProperty('applianceId')
                    && req.body.hasOwnProperty('quantity')
                    && req.body.hasOwnProperty('time'))
            ) {
                res.json({ message: 'Body empty  or not complete', body: req.body })
                console.log('[consumptionApi-Put]insertion impossible body uncomplete :' + JSON.stringify(req.body))
            } else {
                // body parser lets us use the req.body
                Consumption.findOneAndUpdate({
                    applianceId: req.body.applianceId, quantity: req.body.quantity
                }, { $set: { time: req.body.time } }, {
                        new: true
                    })
                    .then((err) => {
                        console.log(err)
                        console.log(doc)
                        if (err) {
                            res.send({ sucses: false, serr: JSON.stringify(err), context: req.body })
                        } else {
                            res.json({ success: true, err: null, context: req.body })
                        }
                    })
                    .catch(err => {
                        console.log('[consumptionApi - put] error' + err)
                        res.send({ sucess: false, err: err.toString(), context: req.body })
                    })
            }
        })
module.exports = consumptionApi
