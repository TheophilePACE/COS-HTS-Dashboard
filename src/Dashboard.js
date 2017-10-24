import React, { Component } from 'react'
import { Line, Pie, Bar } from 'react-chartjs-2'
import hash from 'md5'
import './Dashboard.css'
import { defaults } from 'react-chartjs-2';

// Disable animating charts by default.
defaults.global.animation = false;

class Dashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            getConsumption: props.getConsumption, sizeOfGraphs: props.sizeOfGraphs,
            getPrice: props.getPrice, API_URL: props.API_URL,
            pricePaid: {}, lastNegotiation: {},
            priceBuyingData: {}, priceSellingData: {}, formatedConsumptions: [],
            energyConsumptions: {}, energyBalance: {}
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
            pv.time = (cv.time > pv.time) ? cv.time : pv.time
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
        const appliancesData = fetchResult[0].sort((a, b) => (a.time - b.time))
        const retailersData = fetchResult[1].sort((a, b) => (a.time - b.time))
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
            console.log("[Dashboard] All data fetched")
            this.formatAll(allData)
        })
            .then(() => {
                setTimeout(() => this.componentWillMount(), 5000)
            })
    }

    makeColor(string) {
        const nameHash = hash(string)
        const red = parseInt(('' + nameHash).substring(0, 2), 16)
        const green = parseInt(('' + nameHash).substring(2, 4), 16)
        const blue = parseInt(('' + nameHash).substring(4, 6), 16)

        return `rgb(${red},${green},${blue})`
    }
    render() {
        console.log(`[Dashboard] will render. State :`)
        console.log(this.state)
        return (
            <div className='Dashboard'>
                <div className="flex-container">
                    <div className="flex-item" key={"priceBuyingData"} ref={"priceBuyingData"}>
                        <h2 > Negotiated Buying Price </h2>
                        <label> in (c/kWh) for each hour</label>
                        <Line data={this.state["priceBuyingData"]} redraw
                            width={500} height={250}
                            ref={(ref) => { this["canvas" + "priceBuyingData"] = ref }} />
                    </div>
                    <div className="flex-item" key={"priceSellingData"} ref={"priceSellingData"}>
                        <h2 > Negotiated Selling Price </h2>
                        <label> in (c/kWh) for each hour</label>
                        <Line data={this.state["priceSellingData"]} redraw
                            width={500} height={250}
                            ref={(ref) => { this["canvas" + "priceSellingData"] = ref }} />
                    </div>
                    <div className="flex-item" key={"pricePaid"} ref={"pricePaid"}>
                        <h2 > Global Financial Balance </h2>
                        <label>in AUD </label>
                        <div
                            width={500} height={250}
                            ref={(ref) => { this["canvas" + "pricePaid"] = ref }}>
                            Financial balance = <b>{Math.round(this.state.pricePaid.balance) / 100}</b> <br />
                            Money earned = <b>{Math.round(this.state.pricePaid.amountEarned) / 100}</b> <br />
                            Money paid = <b>{Math.round(this.state.pricePaid.amountPaid) / 100}</b> <br />
                            At time =  <b>{this.state.pricePaid.time}</b> <br />
                        </div>
                    </div>
                    <div className="flex-item" key={"lastNegotiation"} ref={"lastNegotiation"}>
                        <h2 > Last negotiation result </h2>
                        <div
                            style={{ backgroundColor: (this.state.lastNegotiation.quantity > 0) ? "red" : "green" }}
                            width={500} height={250}
                            ref={(ref) => { this["canvas" + "lastNegotiation"] = ref }}>
                            Financial balance = <b>{Math.round(this.state.lastNegotiation.financialBalance) / 100}</b> <i>   in AUD </i> <br />
                            Price = <b>{this.state.lastNegotiation.price}</b> <i>  in c/kWh</i> <br />
                            Quantity = <b>{this.state.lastNegotiation.quantity}</b> <i>   in kWh</i><br />
                            To retailer : <b>{this.state.lastNegotiation.retailerId}</b> <br />
                            At time =  <b>{this.state.lastNegotiation.time}</b> <br />
                        </div>
                    </div>
                    <div className="flex-item" key={"energyConsumptions"} ref={"energyConsumptions"}>
                        <h2 > Consumption of energy </h2>
                        <label> in kWh for each hour</label>
                        <Line data={this.state["energyConsumptions"]} redraw
                            width={500} height={250}
                            ref={(ref) => { this["canvas" + "energyConsumptions"] = ref }} />
                    </div>
                    <div className="flex-item" key={"energyBalance"} ref={"energyBalance"}>
                        <h2 > Balance of energy in the home system </h2>
                        <label> in kWh for each hour</label>
                        <Line data={this.state["energyBalance"]} redraw
                            width={500} height={250}
                            ref={(ref) => { this["canvas" + "energyBalance"] = ref }} />
                    </div>
                </div>
            </div>
        )
    }
}

export default Dashboard
