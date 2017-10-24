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
            accountData: {}, consumptionData: {}, priceData: {},
            balanceData: {}, globalBalance: {}, financialBalance: {},
            applianceBalance: {}, balanceAppliancesProduction: {}, balanceAppliancesConsumption: {},
        }

    }
    fetchAll() {
        const allConsumptions = this.state.getConsumption(this.state.API_URL)
        const allPrices = this.state.getPrice(this.state.API_URL)
        return Promise.all([allConsumptions, allPrices])
    }

    formatPrice(data) {

        return data.reduce((accumulator, cv) => {
            accumulator.labels.push(cv.time)
            accumulator.datasets[0].data.push(cv.price)
            return accumulator
        },
            { labels: [], datasets: [{ label: 'Negotiated Price', data: [], }] })
    }

    formatBalance(consumptionDataset, reducer = () => true) {
        if (consumptionDataset.hasOwnProperty('datasets') && consumptionDataset.hasOwnProperty('labels')) {
            const filteredDatasets = consumptionDataset.datasets.filter(dc => reducer(dc.data.reduce((pv, cv) => pv + cv, 0)))
            const total = filteredDatasets.map(d => d.data.reduce((pv, cv) => pv + Math.abs(cv), 0))
            const labels = filteredDatasets.map(d => d.label)
            const result = {
                datasets: [{
                    data: total,
                    backgroundColor: []
                }],
                labels,
            }
            result.labels.forEach((d, index) => { result.datasets[0].backgroundColor[index] = this.makeColor(d) })
            return result
        } else {
            console.log("[Dashboard] impossible to format balance, lack of data" + JSON.stringify(consumptionDataset))
            return {}
        }
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
        return data.reduce((pv, cv) => {
            let appliance = pv.datasets.find(e => e.label === cv.applianceId)
            if (!Boolean(appliance))//not found
            {
                pv.datasets.push({ label: cv.applianceId, data: [], borderColor: this.makeColor(cv.applianceId) })
                appliance = pv.datasets.find(e => e.label === cv.applianceId)
            }
            appliance.data[parseInt(cv.time, 10)] = cv.quantity
            return pv
        },
            { labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], datasets: [] })
    }
    formatApplianceBalance(consumptionDataset) {
        if (Boolean(consumptionDataset.datasets)) {
            const balanceData = []
            for (let i = 0; i < consumptionDataset.labels.length; i++) {
                let x = 0
                consumptionDataset.datasets.forEach((d) => {
                    x += d.data[i]
                })
                balanceData.push(x)
            }
            const balance = {
                labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                datasets: [{
                    label: 'Balance ',
                    borderColor: 'rgb(94, 0, 109)',
                    data: balanceData
                }]
            }
            const graphData = JSON.parse(JSON.stringify(consumptionDataset))
            graphData.datasets.push(balance)
            return graphData
        } else {
            return {}
        }
    }
    formatGlobalBalance(consumptionDataset) {
        if (Boolean(consumptionDataset.datasets)) {
            const balanceData = []
            for (let i = 0; i < consumptionDataset.labels.length; i++) {
                let x = 0
                consumptionDataset.datasets.forEach((d) => {
                    x += d.data[i]
                })
                balanceData.push(x)
            }
            return ({
                labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                datasets: [{
                    label: 'Balance ',
                    borderColor: 'rgb(94, 0, 109)',
                    backgroundColor: 'rgb(94, 100, 109)',
                    data: balanceData
                }]
            })
        } else {
            return {}
        }
    }
    // computeFinancialBalance(globalBalance, priceDataset) {

    //     return ({
    //         labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    //         datasets: [
    //             {
    //                 label: 'Amount paid, $AUD',
    //                 borderColor: 'rgb(65, 69, 76)',
    //                 data: globalBalance.datasets[0].data.map(
    //                     (energy, index) => energy * pricePaid.datasets[0].data[index]
    //                 )
    //             }
    //         ]
    //     })
    // }

    formatAll(fetchResult) {
        //sort prices and consumptions per time
        const appliancesData = fetchResult[0].sort((a, b) => (a.time - b.time))
        const retailersData = fetchResult[1].sort((a, b) => (a.time - b.time))
        const priceData = this.formatPrice(retailersData)
        const pricePaid = this.formatPricePaid(retailersData)
        const lastNegotiation = this.formatLastNegotiation(retailersData)
        // const consumptionData = this.formatConsumption(appliancesData)
        // const balanceData = this.formatBalance(consumptionData)
        // const balanceAppliancesProduction = this.formatBalance(consumptionData, x => x > 0)
        // const balanceAppliancesConsumption = this.formatBalance(consumptionData, x => x <= 0)
        // const globalBalance = this.formatGlobalBalance(consumptionData)
        // const financialBalance = this.computeFinancialBalance(globalBalance, priceData)
        // const applianceBalance = this.formatApplianceBalance(consumptionData)
        // console.log({ priceData, consumptionData, balanceData, globalBalance, financialBalance, applianceBalance, balanceAppliancesProduction, balanceAppliancesConsumption })
        this.setState({ priceData, pricePaid, lastNegotiation }) // consumptionData, balanceData, globalBalance, financialBalance, applianceBalance, balanceAppliancesProduction, balanceAppliancesConsumption })
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

    // makeToDisplay() {
    //     const toDisplay = []
    //     toDisplay.push({ dataId: 'financialBalance', display: Line })
    //     toDisplay.push({ dataId: 'globalBalance', display: Bar })
    //     toDisplay.push({ dataId: 'priceData', display: Line, title: 'Negotiated Price' })
    //     toDisplay.push({ dataId: 'applianceBalance', display: Line })
    //     toDisplay.push({ dataId: 'balanceAppliancesProduction', display: Pie })
    //     toDisplay.push({ dataId: 'balanceAppliancesConsumption', display: Pie })
    //     return toDisplay
    // }

    // renderGrid(arrayToDisp) {
    //     return (<div className="flex-container">
    //         {arrayToDisp.map(element =>
    //             (<div className="flex-item" key={element.dataId} ref={element.dataId}>
    //                 <h2 > {element.title} </h2>

    //                 {!this.state.graphClicked ?
    //                     (<element.display data={this.state[element.dataId]} redraw
    //                         width={500} height={250}
    //                         ref={(ref) => { this["canvas" + element.dataId] = ref }} />)
    //                     : (<element.display data={this.state[element.dataId]} redraw
    //                         width={1000} height={500} options={{ maintainAspectRatio: false }}
    //                         ref={(ref) => { this["canvas" + element.dataId] = ref }} />)
    //                 }
    //             </div>))}
    //     </div>
    //     )
    // }
    //{ amountPaid: 0, amountEarned: 0, balance: 0, time: 0 }
    render() {
        console.log(`[Dashboard] will render. State :`)
        console.log(this.state)
        return (
            <div className='Dashboard'>
                <div className="flex-container">
                    <div className="flex-item" key={"priceData"} ref={"priceData"}>
                        <h2 > Negotiated Price </h2>
                        <label> in (c/kWh) for each hour</label>
                        <Line data={this.state["priceData"]} redraw
                            width={500} height={250}
                            ref={(ref) => { this["canvas" + "priceData"] = ref }} />
                    </div>
                    <div className="flex-item" key={"pricePaid"} ref={"pricePaid"}>
                        <h2 > Global Financial Balance </h2>
                        <div
                            width={500} height={250}
                            ref={(ref) => { this["canvas" + "pricePaid"] = ref }}>
                            Financial balance = {this.state.pricePaid.balance} <br />
                            Money earned = {this.state.pricePaid.amountEarned} <br />
                            Money paid = {this.state.pricePaid.amountPaid} <br />
                            At time =  {this.state.pricePaid.time} <br />
                        </div>
                    </div>
                    <div className="flex-item" key={"lastNegotiation"} ref={"lastNegotiation"}>
                        <h2 > Last negotiation result </h2>
                        <div
                            style={{ backgroundColor: (this.state.lastNegotiation.quantity > 0) ? "red" : "green" }}
                            width={500} height={250}
                            ref={(ref) => { this["canvas" + "lastNegotiation"] = ref }}>
                            Financial balance = {this.state.lastNegotiation.financialBalance} <br />
                            Price = {this.state.lastNegotiation.price} <br />
                            Quantity = {this.state.lastNegotiation.quantity} <br />
                            To retailer : {this.state.lastNegotiation.retailerId} <br />
                            At time =  {this.state.lastNegotiation.time} <br />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Dashboard
