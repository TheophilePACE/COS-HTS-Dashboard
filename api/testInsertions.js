'use strict'
const { formatConsumption, consumptionData, formatPrice, priceData } = require('./model/fakeData')
const fetch = require('node-fetch')
const insert = (body, url) => {
    const bodyReq = {
        method: 'post',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    }
    fetch(url, bodyReq)
        .then(res => res.json())
        .catch(err => {
            console.error('fetch error : ' + err)
        })
}
const testInsertions = (url) => {
    fetch(url + '/consumptions', {
        method: 'delete',
        body: JSON.stringify({ all: true }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(res => {
            console.log('[fakeInsert] delete result' + JSON.stringify(res))
            console.log('[fakeInsert] inserting fake values')
            const promisesConsoTable = formatConsumption(consumptionData).map((record) => insert(record, url + '/consumptions'))
            Promise.all(promisesConsoTable).then(() => { console.log('[fakeInsert]fake data inserted conso') })
                .catch(err => console.log('[fakeInsert]Error inserting fake data : ' + err))
        })
        .catch(err => { console.log('[fakeInsert] error : ' + (err)) })
    fetch(url + '/prices', {
        method: 'delete',
        body: JSON.stringify({ all: true }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(res => {
            console.log('[fakeInsert] delete result' + JSON.stringify(res))
            const promisesPriceTable = formatPrice(priceData).map((record) => insert(record, url + '/prices'))
            Promise.all(promisesPriceTable).then(() => { console.log('[fakeInsert]fake data inserted price') })
                .catch(err => console.log('[fakeInsert]Error inserting fake data : ' + err))
        })
}

module.exports = { insert, testInsertions }
