const priceRequest = (url, body, method) =>
    fetch(url + '/prices', {
        method: method,
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .catch(err => {
            console.error('fetch error : ' + err)
        })

const getPrice = (url, body) => priceRequest(url, body, 'get')
const createPrice = (url, body) => priceRequest(url, body, 'post')
const deletePrice = (url, body) => priceRequest(url, body, 'delete')
const updatePrice = (url, body) => priceRequest(url, body, 'put')

export { createPrice, getPrice, deletePrice, updatePrice }
