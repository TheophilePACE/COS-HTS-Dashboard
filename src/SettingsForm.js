import React, { Component } from 'react'
import style from "./SettingsForm.css.js"
import TextField from 'material-ui/TextField';
import InputRange from 'react-input-range';
import "react-input-range/lib/css/index.css"


class SettingsForm extends Component {
    constructor(props) {
        super(props)
        this.state = props.settings

    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        console.log({ name, value })
        this.setState({
            [name]: value
        });
    }

    updateSettings(event) {
        this.props.updateSettings(this.state)
        event.preventDefault()
    }

    render() {
        return (
            <form>
                <h1>Settings:</h1>
                <div style={style.inputList}>
                    <div style={style.inputDiv}>
                        <h3>Appliance agent Settings</h3>
                        <TextField
                            type="number"
                            label="Yearly Consumption in (kWh)"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            placeholder={String(this.state.yearlyConsumption)}
                            value={this.state.yearlyConsumption}
                            helperText="Yearly consumption of the house."
                            margin="normal"
                            onChange={(e) => this.setState({ yearlyConsumption: Number.parseFloat(e.target.value, 10) })}

                            name="yearlyConsumption"
                            fullWidth
                        />
                        <label>Consumption Gearing:</label>

                        <div style={{ padding: 20 }}>
                            <InputRange
                                minValue={0.0}
                                maxValue={100}
                                formatLabel={value => `${value}%`}
                                value={this.state.consumptionGearing * 100}
                                onChange={(consumptionGearing) => this.setState({ consumptionGearing: (consumptionGearing / 100) })}
                                onChangeComplete={value => console.log(value)}
                                name="consumptionGearing"
                            />
                        </div>
                    </div>

                    <div style={style.inputDiv}>
                        <h3>Broker agent Settings</h3>

                        <div style={{ padding: 20 }}>
                            <label>Maximum number of negotiation rounds:</label>
                            <br />
                            <InputRange
                                minValue={3}
                                maxValue={50}
                                formatLabel={value => `${value} rounds`}
                                value={this.state.roundsLimit}
                                onChange={(roundsLimit) => this.setState({ roundsLimit })}
                                onChangeComplete={value => console.log(value)}
                                name="roundsLimit"
                            />
                        </div>
                        <div style={{ padding: 20 }}>
                            <label>Minimum price for selling electricity: (in cent/kWh)</label>

                            <TextField
                                type="number"
                                label="minSellingPrice"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                placeholder={String(this.state.minSellingPrice)}
                                value={this.state.minSellingPrice}
                                helperText="Minimum price for selling electricity"
                                margin="normal"
                                onChange={(e) => this.handleInputChange(e)}
                                name="minSellingPrice"
                                fullWidth
                            />
                            <label>Maximum price for buying electricity: (in cent/kWh)</label>

                            <TextField
                                type="number"
                                label="maxBuyingPrice"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                placeholder={String(this.state.maxBuyingPrice)}
                                value={this.state.maxBuyingPrice}
                                helperText="Maximum price for buying electricity."
                                margin="normal"
                                onChange={(e) => this.handleInputChange(e)}
                                name="maxBuyingPrice"
                                fullWidth
                            />
                        </div>

                    </div>

                    <div style={style.inputDiv}>
                        <h3>Home agent Settings</h3>
                        <TextField
                            type="number"
                            label="CYCLE_TIME"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            placeholder={String(this.state.CYCLE_TIME)}
                            value={this.state.CYCLE_TIME}
                            helperText="Time between the beginning of each cycle in ms. Must be a valid number."
                            margin="normal"
                            onChange={(e) => this.setState({ CYCLE_TIME: Number.parseInt(e.target.value, 10) })}
                            name="CYCLE_TIME"
                            fullWidth
                        />
                    </div>



                    <div style={style.inputDiv}>
                        <h3>Generation agent Settings</h3>
                        <TextField
                            type="number"
                            label="Generation Capacity in kWp (kilowatt peak)"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            placeholder={String(this.state.generationCapacity)}
                            value={this.state.generationCapacity}
                            helperText="Electricity generation capacity of the house."
                            margin="normal"
                            onChange={(e) => this.setState({ generationCapacity: Number.parseFloat(e.target.value, 10) })}
                            name="generationCapacity"
                            fullWidth
                        />
                    </div>

                    <div style={style.inputDiv}>
                        <h3>Technical Settings</h3>
                        <TextField
                            label="API_URL"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            placeholder={this.state.API_URL}
                            value={this.state.API_URL}
                            helperText="Address where the agents send their http requests. Must be a valid URL"
                            fullWidth
                            margin="normal"
                            onChange={(e) => this.handleInputChange(e)}
                            name="API_URL"
                        />
                        <TextField
                            type="number"
                            label="JADE_PORT"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            placeholder={String(this.state.JADE_PORT)}
                            value={this.state.JADE_PORT}
                            helperText="HTTP port for the jade system"
                            margin="normal"
                            onChange={(e) => this.handleInputChange(e)}
                            name="JADE_PORT"
                            fullWidth
                        />
                    </div>
                    <div style={style.inputDiv}>
                        <h3> SUBMIT </h3>
                        <button style={{ display: 'inline-block', width: '10vw', height: '7vh', margin: '2', backgroundColor: 'light-blue' }} onClick={(e) => this.updateSettings(e)}> Update my settings </button>
                        <button style={{ display: 'inline-block', width: '10vw', height: '7vh', backgroundColor: 'red', border: '3px solid rgb(135, 4, 0)', margin: '2' }} onClick={() => this.props.resetDB()}>RESET THE SYSTEM </button>

                    </div>
                </div>

            </form>
        );
    }
}

export default SettingsForm
