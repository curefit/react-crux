import * as React from "react"
import * as moment from "moment-timezone"

export const ListDateTimezoneComponent = (props: any) => {
    return <p>{ props.model && (moment(props.model.date).tz(props.model.timezone).format("LLL") + "  " + props.model.timezone)}</p>
}
