
const fetch = require('node-fetch')
const priceApi = (router, API_URI) =>
    router.route('/resetDB')
        .get((req, res) => {
            console.log("[RESETDB] MONGO WILL BE RESET. RECEIVED : ")
            console.log(JSON.stringify(req.query))
            const bodyReq = {
                method: 'delete',
                body: JSON.stringify({ all: true }),
                headers: { 'Content-Type': 'application/json' }
            }
            const p1 = fetch(API_URI + "/api/prices", bodyReq)
                .then(res => res.json())
                .then(json => console.log(json))
                .catch(err => {
                    console.log('[RESETDB] fetch error : ' + err.name + err.message + err.stack)
                })
            const p2 = fetch(API_URI + "/api/consumptions", bodyReq)
                .then(res => res.json())
                .then(json => console.log(json))
                .catch(err => {
                    console.log('[RESETDB] fetch error : ' + err.name + err.message + err.stack)
                })
            Promise.all([p1, p2]).then(() => {
                console.log('[RESETDB] Mongo reset successfully')
                res.json({ success: true })
            }).catch(err => {
                console.log('[RESETDB] error : ' + err.name + err.message + err.stack)
                res.json({ success: false, err })
            })
        })

module.exports = priceApi