import * as React from "react"

export const TitleComponent = (props: any) => {
    const { field } = props
    return (
        <label style={{
            fontSize: "10px",
            marginRight: "10px"
        }}>{field.title.toUpperCase()}
            {field.required ?
                <span style={{
                    color: 'red',
                    fontSize: 11
                }} > * </span> : null}
        </label>
    )
}

