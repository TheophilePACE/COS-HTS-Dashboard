import React, { Component } from 'react'
import './App.css'
import { getConsumption } from './apiWrapper/consumptionApi'
import { getPrice } from './apiWrapper/priceApi'
import ENV from './ENV'
import Dashboard from "./Dashboard"
import SettingsForm from "./SettingsForm"
import { sendSettings, getSettings } from "./apiWrapper/settingsApi"

const API_URL = ENV.API_URL

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayDashboard: false, //true when settings are validated at least once
      APISettings: {}
    }

  }
  updateSettings(settings) {
    console.log(`sending settings: ${JSON.stringify(settings)}`)
    sendSettings(API_URL, settings).then(resp => {
      console.log(`Got response ${JSON.stringify(resp, null, 2)}`)
      if (resp.success) {
        this.setState({ displayDashboard: true })
      } else {
        console.log("Problem with the settings:" + JSON.stringify(settings))
      }
    }).catch(err => {
      console.log("impossible to send settings: " + JSON.stringify(err, null, 2) + JSON.stringify(settings))
    })

  }

  async componentWillMount() {
    const resp = await getSettings(API_URL)
    this.setState({ APISettings: resp.settings })
  }

  render() {
    console.log(`[App-js-render] will render. State :`)
    console.log(this.state)
    return (
      <div className='App'>
        <header className='App-header'>
          <h1 className='App-title'>Home Energy Trading System</h1>
        </header>
        {this.state.displayDashboard ? (
          <div className="main">
            <h1 className='App-intro'>
              Home Dashboard
            </h1>
            <Dashboard sizeOfGraphs={{ width: 1000, height: 500 }}
              getConsumption={getConsumption}
              getPrice={getPrice}
              API_URL={API_URL} />
            <SettingsForm
              updateSettings={(settings) => { this.updateSettings(settings) }}
              settings={this.state.APISettings} />
          </div>
        ) : (JSON.stringify(this.state.APISettings) !== "{}") ? (
          <div className="main">
            <h1 className='App-intro'>
              Validate the settings before launching the system :
              </h1>
            <SettingsForm
              updateSettings={(settings) => { this.updateSettings(settings) }}
              settings={this.state.APISettings}
            />
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
