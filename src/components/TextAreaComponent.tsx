import * as React from "react"
import { TitleComponent } from "./TitleComponent"
import { omit, isEmpty } from "lodash"
function TextAreaComponent(props: any) {
    const [isValueChanged, toggleIsValueChanged] = React.useState(false)
    const [previousValue, togglePreviousValue] = React.useState(props.value ? props.value : "")
    if (previousValue !== props.value && !isValueChanged) {
        toggleIsValueChanged(true)
    } else if (previousValue === props.value && isValueChanged) {
        toggleIsValueChanged(false)
    }
    return <>
        {!isEmpty(props.title) && <span>
            <TitleComponent modalType={props.modalType} field={props.field} isValueChanged={isValueChanged} /><br /></span>}
        <textarea
            disabled={props.disabled}
            type={props.type}
            value={props.value}
            onChange={(e) => props.onChange(e)}
            style={props.style}
            {...props}
        /></>;
}

export default TextAreaComponent;