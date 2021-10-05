import * as React from "react"

const moment = require("moment")

export const ListDateComponent = (props: any) => {
    return <p>{props.field.showTimeSelect ? moment(props.model).format("LLL") : moment(props.model).format("ll")}</p>
}
