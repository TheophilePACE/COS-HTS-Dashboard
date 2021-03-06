import React, { Component } from 'react'
import './App.css'
import { getConsumption } from './apiWrapper/consumptionApi'
import { getPrice } from './apiWrapper/priceApi'
import Dashboard from "./Dashboard"
import SettingsForm from "./SettingsForm"
import { sendSettings, getSettings } from "./apiWrapper/settingsApi"


console.log("Coucou c'est la CI")
const API_URL = process.env.API_URL || "http://localhost:3001/api"
if (!API_URL)
  throw new Error("API URL IS NOT DEFINED")

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayDashboard: true,
      APISettings: {}
    }

  }
  updateSettings(settings) {
    console.log(`sending settings: ${JSON.stringify(settings)}`)
    sendSettings(API_URL, settings)
      .then(resp => {
        console.log(`Got response ${JSON.stringify(resp, null, 2)}`)
      })
      .catch(err => {
        console.log("impossible to send settings: " + JSON.stringify(err, null, 2) + JSON.stringify(settings))
      })

  }

  async componentWillMount() {
    const APISettings = await getSettings(API_URL)
    this.setState({ APISettings })
  }

  resetDB() {
    fetch(API_URL + "/resetDB")
      .then(res => res.json()).then(json => console.log(json))
      .catch(err => console.log(err))
  }

  render() {
    console.log(`[App-js-render] will render. State :`)
    console.log(this.state)
    return (
      <div className='App'>
        <header className='App-header'>
          <h1 style={{ display: 'inline-block' }} className='App-title'>Home Energy Trading System</h1>
        </header>
        {(JSON.stringify(this.state.APISettings) !== "{}" && this.state.APISettings !== undefined) ? (
          <div className="main">
            <h1 className='App-intro'>
              Home Dashboard
            </h1>
            <Dashboard sizeOfGraphs={{ width: 1000, height: 500 }}
              getConsumption={getConsumption}
              getPrice={getPrice}
              API_URL={API_URL}
              CYCLE_TIME={this.state.APISettings.CYCLE_TIME}
              resetDB={this.resetDB} />
            <SettingsForm
              updateSettings={(settings) => { this.updateSettings(settings) }}
              settings={this.state.APISettings} />
          </div>
        ) : (
            <div>
              {console.log("Soon,  we will have a loader")}
              Thanks for waiting a few sec!
            </div>
          )}
      </div>
    )
  }
}

export default App
