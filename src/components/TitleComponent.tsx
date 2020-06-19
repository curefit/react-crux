import * as React from "react"

export const TitleComponent = (props: any) => {
    return (
        <label style={{
            fontSize: "10px",
            marginRight: "10px"
        }}>{props.field.title.toUpperCase()}
            {props.field.required ?
                <span style={{
                    color: 'red',
                    fontSize: 11
                }}> * </span> : null}
        </label>
    )
}

