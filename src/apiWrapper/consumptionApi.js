const consumptionRequest = (url, body, method) =>
    fetch(url + '/consumptions', {
        method: method,
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .catch(err => {
            console.error('fetch error : ' + err)
        })

const getConsumption = (url, body) => consumptionRequest(url, body, 'get')
const createConsumption = (url, body) => consumptionRequest(url, body, 'post')
const deleteConsumption = (url, body) => consumptionRequest(url, body, 'delete')
const updateConsumption = (url, body) => consumptionRequest(url, body, 'put')

export { createConsumption, getConsumption, deleteConsumption, updateConsumption }
