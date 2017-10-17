import React, { Component } from 'react'
import { Line, Pie, Bar } from 'react-chartjs-2'
import hash from 'md5'
import './Dashboard.css'

class Dashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            getConsumption: props.getConsumption, sizeOfGraphs: props.sizeOfGraphs,
            getPrice: props.getPrice, API_URL: props.API_URL,
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
        return data.reduce((pv, cv) => {
            let retailer = pv.datasets.find(e => e.label === cv.retailerId)
            if (!Boolean(retailer))//not found
            {
                pv.datasets.push({ label: cv.retailerId, data: [], borderColor: this.makeColor(cv.retailerId) })
                retailer = pv.datasets.find(e => e.label === cv.retailerId)
            }
            retailer.data[parseInt(cv.time, 10)] = cv.price
            return pv
        },
            { labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], datasets: [] })
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
        //TODO: IMPLEMENT ME
        return priceDataset
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
    computeFinancialBalance(globalBalance, priceDataset) {
        const pricePaid = this.formatPricePaid(priceDataset)
        return ({
            labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            datasets: [
                {
                    label: 'Amount paid, $AUD',
                    borderColor: 'rgb(65, 69, 76)',
                    data: globalBalance.datasets[0].data.map(
                        (energy, index) => energy * pricePaid.datasets[0].data[index]
                    )
                }
            ]
        })
    }
    componentWillMount() {
        this.fetchAll().then((allData) => {
            console.log("[Dashboard] All data fetched")
            const appliancesData = allData[0]
            const retailersData = allData[1]
            const priceData = this.formatPrice(retailersData)
            const consumptionData = this.formatConsumption(appliancesData)
            const balanceData = this.formatBalance(consumptionData)
            const balanceAppliancesProduction = this.formatBalance(consumptionData, x => x > 0)
            const balanceAppliancesConsumption = this.formatBalance(consumptionData, x => x <= 0)
            const globalBalance = this.formatGlobalBalance(consumptionData)
            const financialBalance = this.computeFinancialBalance(globalBalance, priceData)
            const applianceBalance = this.formatApplianceBalance(consumptionData)
            this.setState({ priceData, consumptionData, balanceData, globalBalance, financialBalance, applianceBalance, balanceAppliancesProduction, balanceAppliancesConsumption })


        })
    }

    makeColor(string) {
        const nameHash = hash(string)
        const red = parseInt(('' + nameHash).substring(0, 2), 16)
        const green = parseInt(('' + nameHash).substring(2, 4), 16)
        const blue = parseInt(('' + nameHash).substring(4, 6), 16)

        return `rgb(${red},${green},${blue})`
    }

    makeToDisplay() {
        const toDisplay = []
        toDisplay.push({ dataId: 'financialBalance', display: Line })
        toDisplay.push({ dataId: 'globalBalance', display: Bar })
        toDisplay.push({ dataId: 'priceData', display: Line })
        toDisplay.push({ dataId: 'applianceBalance', display: Line })
        toDisplay.push({ dataId: 'balanceAppliancesProduction', display: Pie })
        toDisplay.push({ dataId: 'balanceAppliancesConsumption', display: Pie })
        return toDisplay
    }

    renderGrid(arrayToDisp) {
        return (<div className="flex-container">
            {arrayToDisp.map(element =>
                (<div className="flex-item" key={element.dataId} ref={element.dataId}
                    onClick={(e) => this.handleColClick(e, element.dataId)}>
                    <h2 > {element.dataId} </h2>

                    {!this.state.graphClicked ?
                        (<element.display data={this.state[element.dataId]}
                            width={500} height={250}
                            ref={(ref) => { this["canvas" + element.dataId] = ref }} />)
                        : (<element.display data={this.state[element.dataId]}
                            width={1000} height={500} options={{ maintainAspectRatio: false }}
                            ref={(ref) => { this["canvas" + element.dataId] = ref }} />)
                    }
                </div>))}
        </div>
        )
    }

    render() {
        console.log(`[Dashboard] [App-js-render] will render. State :`)
        console.log("[Dashboard]" + this.state)
        return (
            <div className='Dashboard'>
                {this.renderGrid(this.makeToDisplay())}
            </div>
        )
    }
}

export default Dashboard
