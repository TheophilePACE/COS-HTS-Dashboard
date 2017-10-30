const util = require('util');
const fs = require('fs');

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const readDefaultSettings = (pathToSettings, pathToDefaultSettings) =>
    readFile(pathToDefaultSettings, 'utf8')
        .then(defaultSettingsFile => {
            const json = JSON.parse(defaultSettingsFile) //ensure integrity of JSON
            console.log(`Starting with settings: ${JSON.stringify(json)}`)
            return JSON.stringify(json)
        })
        .then(defaultSettingsJSON => writeFile(pathToSettings, defaultSettingsJSON, 'utf8'))
        .catch(err => {
            console.log("unable to start settings API")
            throw new Error(err)
        })
const settingsApi = (router, pathToSettings, pathToDefaultSettings) =>
    readDefaultSettings(pathToSettings, pathToDefaultSettings).then(() =>
        router.route('/settings')
            .get((req, res) => {
                readFile(pathToSettings, 'utf8')
                    .then(settingsFileString => res.json(JSON.parse(settingsFileString)))
                    .catch(err => {
                        console.log("[settingsApi get] Error reading settings")
                        console.log(err)
                        res.send({ err, success: false })
                    })
            })
            .post((req, res) => {
                try {
                    JSON.parse(JSON.stringify(req.body))
                } catch (err) {
                    console.log("[settingsApi post] NOt a json. Seetings won't be updated")
                    console.log(req.body)
                    res.send({ err, success: false })
                    return
                }
                readFile(pathToSettings, 'utf8')
                    .then(settingsFile => JSON.parse(settingsFile))
                    .then(settingsFileJSON => {
                        Object.keys(req.body).forEach(key => {
                            settingsFileJSON[key] = req.body[key]
                        })
                        return JSON.stringify(settingsFileJSON)
                    })
                    .then(newSettingsString => {
                        writeFile(pathToSettings, newSettingsString, 'utf8')
                            .then(err => {
                                if (err)
                                    res.send({ success: false, err })
                                else
                                    res.json({ success: true, settings: JSON.parse(newSettingsString) })
                            })
                    })

                    .catch(err => {
                        console.log("[settingsApi post] Error updating settings")
                        console.log(err)
                        res.send(err)
                    })
            })
    )
module.exports = settingsApi
