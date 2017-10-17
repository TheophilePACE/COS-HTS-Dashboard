const sendSettings = (url, body) =>
    fetch(url + "/settings", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .catch(err => {
            console.error('fetch error : ' + err)
        })
const getSettings = (url) =>
    fetch(url + "/settings", {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .catch(err => {
            console.error('fetch error : ' + err)
        })

export { sendSettings, getSettings }