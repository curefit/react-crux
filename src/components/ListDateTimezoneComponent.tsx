import * as React from "react"

const moment = require("moment-timezone")

export const ListDateTimezoneComponent = (props: any) => {
    return <p>{ props.model && (moment(props.model.date).tz(props.model.timezone).format("LLL") + "  " + props.model.timezone)}</p>
}
