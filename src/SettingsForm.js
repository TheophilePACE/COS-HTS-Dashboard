import React, { Component } from 'react'
import style from "./SettingsForm.css.js"
import Switch from 'material-ui/Switch';
import TextField from 'material-ui/TextField';


class SettingsForm extends Component {
    constructor(props) {
        super(props)
        this.state = props.settings
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

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
                        <label>
                            <h3>Always sell:</h3>
                            <Switch
                                name="alwaysSell"
                                checked={this.state.alwaysSell}
                                onChange={(e) => this.handleInputChange(e)}
                            />
                            <i>Always sell the electricity production. Disable the minimum price.</i>
                        </label>

                        <label style={this.state.alwaysSell ? style.disabledLabel : style.abledLabel}>
                            <h3>Minimum price for selling electricity:</h3>
                            <input disabled={this.state.alwaysSell}
                                name="minPrice"
                                type="number"
                                value={this.state.minPrice}
                                onChange={(e) => this.handleInputChange(e)} />
                        </label>
                    </div>
                    <div style={style.inputDiv}>
                        <label>
                            <h3>Always buy:</h3>
                            <Switch
                                name="alwaysBuy"
                                checked={this.state.alwaysBuy}
                                onChange={(e) => this.handleInputChange(e)}
                            />
                            <i>Always Buy the electricity production. Disable the Maximum price.</i>
                        </label>
                        <label style={this.state.alwaysBuy ? style.disabledLabel : style.abledLabel}>
                            <h3>Maximum price for Buying electricity:</h3>
                            <input disabled={this.state.alwaysBuy}
                                name="maxPrice"
                                type="number"
                                value={this.state.maxPrice}
                                onChange={(e) => this.handleInputChange(e)} />
                        </label>
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
                            onChange={(e) => this.handleInputChange(e)}
                            name="CYCLE_TIME"
                            fullWidth
                        />
                    </div>
                </div>
                <button onClick={(e) => this.updateSettings(e)}> Update my settings </button>
            </form>
        );
    }
}

export default SettingsForm