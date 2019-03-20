import * as React from "react"
import * as moment from "moment"

export const ListDateComponent = (props: any) => {
    return <p>{props.field.showTimeSelect ? moment(props.model).format("LLL") : moment(props.model).format("ll")}</p>
}
