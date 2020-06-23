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
                    fontSize: 11
                }} className="text-danger"> * </span> : null}
        </label>
    )
}

