import React, { Component } from 'react'
import { Line } from 'react-chartjs-2'
import './Dashboard.css'
import { defaults } from 'react-chartjs-2';
import TextField from 'material-ui/TextField';

const tile = { width: '40vw', height: 'auto' }
// Disable animating charts by default.
defaults.global.animation = false;

class Dashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            getConsumption: props.getConsumption, sizeOfGraphs: props.sizeOfGraphs, CYCLE_TIME: props.CYCLE_TIME,
            getPrice: props.getPrice, API_URL: props.API_URL,
            pricePaid: {}, lastNegotiation: {},
            priceBuyingData: {}, priceSellingData: {}, formatedConsumptions: [],
            energyConsumptions: {}, energyBalance: {},
            viewSince: 0, viewSinceField: 0

        }

    }
    fetchAll() {
        const allConsumptions = this.state.getConsumption(this.state.API_URL)
        const allPrices = this.state.getPrice(this.state.API_URL)
        return Promise.all([allConsumptions, allPrices])
    }

    formatPriceBuying(data) {

        return data.reduce((accumulator, cv) => {
            accumulator.labels.push(cv.time)
            accumulator.datasets[0].data.push((cv.quantity > 0) ? cv.price : 0)
            return accumulator
        },
            { labels: [], datasets: [{ label: 'Negotiated Buying Price', data: [], borderColor: 'red' }] })
    }

    formatPriceSelling(data) {

        return data.reduce((accumulator, cv) => {
            accumulator.labels.push(cv.time)
            accumulator.datasets[0].data.push((cv.quantity <= 0) ? cv.price : 0)
            return accumulator
        },
            { labels: [], datasets: [{ label: 'Negotiated Selling Price', data: [], borderColor: 'green' }] })
    }
    formatPricePaid(priceDataset) {
        return priceDataset.reduce((pv, cv) => {
            if (cv.quantity > 0)
                pv.amountPaid += (cv.quantity * cv.price)
            else
                pv.amountEarned += (cv.quantity * cv.price)
            pv.balance += (cv.quantity * cv.price)
            pv.time = Math.max(cv.time, pv.time)
            return pv
        }, { amountPaid: 0, amountEarned: 0, balance: 0, time: 0 })
    }
    formatLastNegotiation(priceDataset) {
        const lastNegotiation = priceDataset[priceDataset.length - 1]
        if (!lastNegotiation)
            return {
                quantity: 0,
                time: 0,
                price: 0,
                retailerId: 0,
                financialBalance: 0
            }
        return {
            quantity: lastNegotiation.quantity,
            time: lastNegotiation.time,
            price: lastNegotiation.price,
            retailerId: lastNegotiation.retailerId,
            financialBalance: (lastNegotiation.price * lastNegotiation.quantity)
        }
    }
    formatConsumption(data) {
        return data.reduce((accumulator, cv) => {
            let timedataset = accumulator.find(e => e.time === cv.time)
            if (!Boolean(timedataset)) {
                accumulator.push({
                    time: cv.time,
                    consumptions: []
                })
                timedataset = accumulator.find(e => e.time === cv.time)
            }

            timedataset.consumptions.push({ quantity: cv.quantity, consumptionType: cv.consumptionType })
            return accumulator
        },
            [])
    }
    formatEnergyConsumption(data) {
        return data.reduce((accumulator, cv) => {
            let base_load = cv.consumptions.find(e => e.consumptionType === "base_load") || { quantity: 0 }
            let fluctuating_load = cv.consumptions.find(e => e.consumptionType === "fluctuating_load") || { quantity: 0 }

            accumulator.labels.push(cv.time)
            accumulator.datasets[0].data.push(base_load.quantity)
            accumulator.datasets[1].data.push(fluctuating_load.quantity)
            accumulator.datasets[2].data.push(fluctuating_load.quantity + base_load.quantity)
            return accumulator
        },
            {
                labels: [], datasets: [
                    { label: 'base_load', data: [], borderColor: 'rgb(255, 132, 132)' },
                    { label: 'fluctuating_load', data: [], borderColor: 'rgb(255, 100, 100)' },
                    { label: 'total consumption', data: [], borderColor: 'red' }
                ]
            })
    }
    formatEnergyBalance(data) {
        return data.reduce((accumulator, cv) => {
            let base_load = cv.consumptions.find(e => e.consumptionType === "base_load") || { quantity: 0 }
            let fluctuating_load = cv.consumptions.find(e => e.consumptionType === "fluctuating_load") || { quantity: 0 }
            let PV_generation = cv.consumptions.find(e => e.consumptionType === "PV_generation") || { quantity: 0 }

            accumulator.labels.push(cv.time)
            accumulator.datasets[0].data.push(PV_generation.quantity)
            accumulator.datasets[1].data.push(fluctuating_load.quantity + base_load.quantity)
            accumulator.datasets[2].data.push(fluctuating_load.quantity + base_load.quantity + PV_generation.quantity)

            return accumulator
        },
            {
                labels: [], datasets: [
                    { label: 'PV_generation', data: [], borderColor: 'green' },
                    { label: 'total consumption', data: [], borderColor: 'red' },
                    { label: 'balance', data: [], borderColor: 'grey' },
                ]
            })
    }


    formatAll(fetchResult) {
        //sort prices and consumptions per time
        const appliancesData = fetchResult[0].filter(record => record.time > this.state.viewSince).sort((a, b) => (a.time - b.time))
        const retailersData = fetchResult[1].filter(record => record.time > this.state.viewSince).sort((a, b) => (a.time - b.time))
        const priceBuyingData = this.formatPriceBuying(retailersData)
        const priceSellingData = this.formatPriceSelling(retailersData)
        const pricePaid = this.formatPricePaid(retailersData)
        const lastNegotiation = this.formatLastNegotiation(retailersData)
        const formatedConsumptions = this.formatConsumption(appliancesData)
        const energyConsumptions = this.formatEnergyConsumption(formatedConsumptions)
        const energyBalance = this.formatEnergyBalance(formatedConsumptions)
        this.setState({ priceBuyingData, priceSellingData, pricePaid, lastNegotiation, formatedConsumptions, energyConsumptions, energyBalance })
    }
    componentWillMount() {
        this.fetchAll().then((allData) => {
            this.formatAll(allData)
        })
            .then(() => {
                setTimeout(() => this.componentWillMount(), 2000)
            })
    }

    render() {
        return (
            <div className='Dashboard'>
                <div className="flex-container">
                    <div className="flex-item" key={"pricePaid"} ref={"pricePaid"}>
                        <h2 > Global Financial Balance </h2>
                        <label>in AUD </label>
                        <div style={tile}
                            ref={(ref) => { this["canvaspricePaid"] = ref }}>
                            <label style={{ color: (this.state.pricePaid.balance > 0) ? "red" : "green" }}>Financial balance = <b> {String(Math.round(this.state.pricePaid.balance) / 100)}</b> <br /></label>
                            <label style={{ color: "green" }}>Money earned = <b>{String(Math.round(this.state.pricePaid.amountEarned) / 100)}</b> <br /></label>
                            <label style={{ color: "red" }}>Money paid = <b>{String(Math.round(this.state.pricePaid.amountPaid) / 100)}</b> <br /></label>
                            At time =  <b>{String(this.state.pricePaid.time)}</b> <br />
                        </div>
                    </div>
                    <div className="flex-item" key={"lastNegotiation"} ref={"lastNegotiation"} style={tile}>
                        <h2 > Last negotiation result </h2>
                        <div style={{
                            backgroundColor: (this.state.lastNegotiation.quantity > 0) ? "red" : "green"
                        }}
                            ref={(ref) => { this["canvaslastNegotiation"] = ref }}>
                            <label>Financial balance = <b>{String(Math.round(this.state.lastNegotiation.financialBalance) / 100)}</b> <i>   in AUD </i> </label><br />
                            <label>Price = <b>{String(this.state.lastNegotiation.price)}</b> <i>  in c/kWh</i> </label><br />
                            <label>Quantity = <b>{String(this.state.lastNegotiation.quantity)}</b> <i>   in kWh</i></label><br />
                            <label>To retailer : <b>{String(this.state.lastNegotiation.retailerId)}</b> </label><br />
                            <label>At time =  <b>{String(this.state.lastNegotiation.time)}</b> </label><br />
                        </div>
                    </div>
                    <div style={tile} className="flex-item" key={"priceBuyingData"} ref={"priceBuyingData"}>
                        <h2 > Negotiated Buying Price </h2>
                        <label> in (c/kWh) for each hour</label>
                        <Line data={this.state["priceBuyingData"]} redraw
                            width={500} height={250}
                            ref={(ref) => { this["canvaspriceBuyingData"] = ref }} />
                    </div>
                    <div className="flex-item" key={"priceSellingData"} ref={"priceSellingData"} style={tile}>
                        <h2 > Negotiated Selling Price </h2>
                        <label> in (c/kWh) for each hour</label>
                        <Line data={this.state["priceSellingData"]} redraw
                            width={500} height={250}
                            ref={(ref) => { this["canvaspriceSellingData"] = ref }} />
                    </div>

                    <div className="flex-item" key={"energyConsumptions"} ref={"energyConsumptions"} style={tile}>
                        <h2 > Consumption of energy </h2>
                        <label> in kWh for each hour</label>
                        <Line data={this.state["energyConsumptions"]} redraw
                            width={500} height={250}
                            ref={(ref) => { this["canvasenergyConsumptions"] = ref }} />
                    </div>
                    <div className="flex-item" key={"energyBalance"} ref={"energyBalance"} style={tile}>
                        <h2 > Balance of energy in the home system </h2>
                        <label> in kWh for each hour</label>
                        <Line data={this.state["energyBalance"]} redraw
                            width={500} height={250}
                            ref={(ref) => { this["canvasenergyBalance"] = ref }} />
                    </div>
                    <div className="flex-item" key={"options"} ref={"options"} style={tile}>
                        <h2>Options</h2>
                        <p> View only the data generated by the system since the hour : </p>
                        <TextField
                            type="number"
                            label="viewSinceField"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            placeholder={String(this.state.viewSinceField)}
                            value={this.state.viewSinceField}
                            helperText="Time to view from."
                            margin="normal"
                            onChange={(e) => this.setState({ viewSinceField: Number.parseInt(e.target.value, 10) })}
                            name="this.state.viewSinceField"
                            fullWidth
                        />
                        <button style={{ display: 'inline-block', width: '10vw', height: '7vh', margin: '2', backgroundColor: 'blue' }}
                            onClick={() => this.setState({ viewSince: this.state.viewSinceField })}> Update the view </button>
                    </div>
                    <div className="flex-item" key={"resetSystem"} ref={"resetSystem"} style={tile}>
                        <h2>reset the system</h2>
                        <button style={{ display: 'inline-block', width: '10vw', height: '7vh', backgroundColor: 'red', border: '3px solid rgb(135, 4, 0)', margin: '2' }}
                            onClick={() => this.props.resetDB()}>RESET THE SYSTEM </button>

                    </div>
                </div>

            </div>
        )
    }
}

export default Dashboard
