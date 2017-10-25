
const fetch = require('node-fetch')
const priceApi = (router, API_URI) =>
    router.route('/resetDB')
        .get((req, res) => {
            console.log("[RESETDB] MONGO WILL BE RESET. RECEIVED : ")
            console.log(JSON.stringify(req.query))
            const bodyReq = {
                method: 'delete',
                body: !req.query.from ?
                    (JSON.stringify({ all: true }))
                    : JSON.stringify({ time: { $lt: req.query.from } }),
                headers: { 'Content-Type': 'application/json' }
            }
            const p1 = fetch(API_URI + "/api/prices", bodyReq)
                .then(res => res.json())
                .then(json => console.log(json))
                .catch(err => {
                    console.error('fetch error : ' + err)
                })
            const p2 = fetch(API_URI + "/api/consumptions", bodyReq)
                .then(res => res.json())
                .then(json => console.log(json))
                .catch(err => {
                    console.error('fetch error : ' + err)
                })
            Promise.all([p1, p2]).then(() => {
                console.log('[RESETDB] Mongo reset successfully')
                res.json({ success: true })
            }).catch(err => {
                console.log('[RESETDB] error in reseting mongo : ')
                console.log(err)
                res.json(err)
            })
        })

module.exports = priceApi