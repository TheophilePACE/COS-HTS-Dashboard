import green from 'material-ui/colors/green';

const green500 = green[500]
export default {
    SettingsFormStyle: {

    },

    disabledLabel: {
        display: "none"
    },

    abledLabel: {
        backgroundColor: "rgba(117, 117, 117, 0)",
        border: "1px solid rgba(46, 42, 114, 0)"
    },
    inputList: {
        display: 'inline-block'
    },
    inputDiv: {
        display: 'inline-block',
        backgroundColor: "rgba(82, 99, 175, 0.125)",
        margin: '1vw',
        borderRadius: '1vw',
        padding: "1vw",
        align: 'top',
        maxWidth: '30vw',
        minWidth: '400px',


    },

    bar: {},
    checked: {
        color: green500,
        '& + $bar': {
            backgroundColor: green500,
        },
    },
}

