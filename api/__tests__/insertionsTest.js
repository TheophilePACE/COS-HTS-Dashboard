'use strict'
const fetch = require('node-fetch')

const { fakePrices, fakeConsumptions } = require('../testAssets/fakeData')

const API_URL = 'http://localhost:3001/api'
const insert = (body, url) => {
    const bodyReq = {
        method: 'post',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    }
    return fetch(url, bodyReq)
        .then(res => res.json())
        .catch(err => {
            console.error('fetch error : ' + err)
        })
}

describe('Test of prices and consumptions API, delete and insert', () => {
    it('Empty the API', () => {
        return fetch(API_URL + '/resetDB').then(resp => resp.json()).then(deleteJson => {
            expect(deleteJson.success).toEqual(true)
        })
    })
    it('verify if the prices db is empty', async () => {
        return fetch(API_URL + '/prices').then(apiResp => apiResp.json()).then(apiResp => {
            expect(apiResp.length).toEqual(0)
        })
    })
    it('verify if the consumptions db is empty', async () => {
        return fetch(API_URL + '/consumptions').then(apiResp => apiResp.json()).then(apiResp => {
            expect(apiResp.length).toEqual(0)
        })
    })
    it('insertion of prices', async () => {
        const promisesArray = fakePrices.map(fakeP => insert(fakeP, API_URL + '/prices'))
        return Promise.all(promisesArray).then(result => {
            result.forEach(value => {
                expect(value.success).toEqual(true)
            })
        })
    })
    it('insertion of consumptions', async () => {
        const promisesArray = fakeConsumptions.map(fakeP => insert(fakeP, API_URL + '/consumptions'))
        return Promise.all(promisesArray).then(result => {
            result.forEach(value => {
                expect(value.success).toEqual(true)
            })
        })
    })
    it('check the number of  prices in the  db', async () => {
        return fetch(API_URL + '/prices').then(apiResp => apiResp.json()).then(apiResp => {
            expect(apiResp.length).toEqual(fakePrices.length)
        })
    })
    it('check the number of  consumptions in the  db', async () => {
        return fetch(API_URL + '/consumptions').then(apiResp => apiResp.json()).then(apiResp => {
            expect(apiResp.length).toEqual(fakeConsumptions.length)
        })
    })
    it('trying to insert uncomplete price', () => {
        return insert({
            "quantity": 0.167,
            "price": 8,
            "retailerId": "retailAgent3"
        }, API_URL + '/prices').then(apiResp => {
            expect(apiResp.success).toEqual(false)
            expect(apiResp.message).toEqual('Body empty  or not complete')
            expect(apiResp.body).toEqual({
                "quantity": 0.167,
                "price": 8,
                "retailerId": "retailAgent3"
            })
        })
    })
    it('trying to insert uncomplete consumption', () => {
        return insert({
            "consumptionType": "PV_generation",
            "time": 13,
            "quantity": -2.131,
        }, API_URL + '/consumptions').then(apiResp => {
            expect(apiResp.success).toEqual(false)
            expect(apiResp.message).toEqual('Body empty  or not complete')
            expect(apiResp.body).toEqual({
                "consumptionType": "PV_generation",
                "time": 13,
                "quantity": -2.131,
            })
        })
    })
    it('trying to insert empty price', () => {
        return insert({}, API_URL + '/prices').then(apiResp => {
            expect(apiResp.success).toEqual(false)
            expect(apiResp.message).toEqual('Body empty  or not complete')
            expect(apiResp.body).toEqual({})
        })
    })

    it('trying to insert empty body', () => {
        return fetch(API_URL + '/prices', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(async res => {
                return res.json()
            }).then(apiResp => {
                expect(apiResp.success).toEqual(false)
                expect(apiResp.message).toEqual('Body empty  or not complete')
                expect(apiResp.body).toEqual({})
            })
    })
})