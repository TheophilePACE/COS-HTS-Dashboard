'use strict'
const fetch = require('node-fetch')

const { fakePrices, fakeConsumptions } = require('../testAssets/fakeData')

const API_URL = process.env.API_URL || (() => { throw new Error("no api url") })()
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

describe('[INTEGRATION TEST] Test of RESETDB, prices and consumptions API, delete and insert', () => {
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

describe('[INTEGRATION TEST] Test of settings API, ', () => {
    let defaultJson = {}
    it('Check if default settings contains what they are supposed to', () => {
        return fetch(API_URL + '/settings').then(resp => resp.json()).then(settingsJson => {
            expect(settingsJson).toHaveProperty("API_URL")
            expect(settingsJson).toHaveProperty("JADE_PORT")
            expect(settingsJson).toHaveProperty("CYCLE_TIME")
            expect(settingsJson).toHaveProperty("yearlyConsumption")
            expect(settingsJson).toHaveProperty("consumptionGearing")
            expect(settingsJson).toHaveProperty("generationCapacity")
            expect(settingsJson).toHaveProperty("roundsLimit")
            expect(settingsJson).toHaveProperty("maxBuyingPrice")
            expect(settingsJson).toHaveProperty("minSellingPrice")
        })
    })
    it('send a valid JSON', async () => {
        const testSettings = { test: "test", myTest: "test", fulltest: 1234, boolbool: true }
        return insert(testSettings, API_URL + '/settings')
            .then(settingsJson => {
                expect(settingsJson.success).toEqual(true)
                expect(settingsJson.settings).toHaveProperty("API_URL")
                expect(settingsJson.settings).toHaveProperty("JADE_PORT")
                expect(settingsJson.settings).toHaveProperty("CYCLE_TIME")
                expect(settingsJson.settings).toHaveProperty("yearlyConsumption")
                expect(settingsJson.settings).toHaveProperty("consumptionGearing")
                expect(settingsJson.settings).toHaveProperty("generationCapacity")
                expect(settingsJson.settings).toHaveProperty("roundsLimit")
                expect(settingsJson.settings).toHaveProperty("maxBuyingPrice")
                expect(settingsJson.settings).toHaveProperty("minSellingPrice")
                Object.keys(testSettings).forEach((objectKey) => {
                    expect(settingsJson.settings).toHaveProperty(objectKey)
                    expect(settingsJson.settings[objectKey]).toEqual(testSettings[objectKey])
                })
            })
    })

    it('send a malformed Json', async () => {
        return insert("{'malformed':tre}", API_URL + '/settings')
            .then(respJson => {
                expect(respJson.success).toEqual(false)
                expect(respJson.message).toEqual('malformed json')
                expect(respJson.err.name).toEqual('SyntaxError')
            })
    })
})
