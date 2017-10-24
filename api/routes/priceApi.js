'use strict'
const Price = require('../model/priceModel')

const priceApi = (router) =>
    router.route('/prices')
        .get((req, res) => {
            Price.find(req.body.options).then((prices) => {
                // responds with a json object of our database prices.
                res.json(prices)
            }).catch(err => {
                console.log(err)
                res.send(err)
            })
        })
        .post((req, res) => {
            if (!(req.body.hasOwnProperty('retailerId')
                && req.body.hasOwnProperty('price')
                && req.body.hasOwnProperty('time'))) {
                res.json({ message: 'Body empty  or not complete', body: req.body })
                console.log('[priceApi-Post]insertion impossible body uncomplete :' + JSON.stringify(req.body))
            } else {
                const price = new Price()
                // body parser lets us use the req.body
                price.retailerId = req.body.retailerId
                price.price = req.body.price
                price.time = req.body.time
                price.quantity = req.body.quantity

                price.save((err) => {
                    if (err) {
                        res.send(err)
                    }
                    console.log("[API PRICE] post succeded" + price)

                    res.json({ message: 'price successfully added!' })
                })
            }
        })
        .delete((req, res) => {
            let rm
            if (req.body.all) {
                rm = Price.remove({})
            } else {
                const body = {}
                body.retailerId = req.body.retailerId
                body.price = req.body.price
                body.time = req.body.time
                rm = Price.remove(body)
            }
            rm.then(result => {
                console.log('[delete Price]: ' + JSON.stringify(req.body) + ' ==> ' + result)
                res.json({ result })
            })
        })
        .put((req, res) => {
            if (!
                (req.body.hasOwnProperty('retailerId')
                    && req.body.hasOwnProperty('price')
                    && req.body.hasOwnProperty('time'))
            ) {
                res.json({ message: 'Body empty  or not complete', body: req.body })
                console.log('[priceApi-put]insertion impossible body uncomplete :' + JSON.stringify(req.body))
            } else {
                // body parser lets us use the req.body
                Price.findOneAndUpdate({
                    retailerId: req.body.retailerId, time: req.body.time
                }, { $set: { price: req.body.price } }, {
                        new: true
                    })
                    .then((err) => {
                        console.log(err)
                        console.log(doc)
                        if (err) {
                            res.send({ success: false, serr: JSON.stringify(err), context: req.body })
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

module.exports = priceApi
