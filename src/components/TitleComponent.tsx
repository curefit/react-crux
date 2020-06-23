import * as React from "react"

export const TitleComponent = (props: any) => {
    const { field } = props
    return (
        <label className="small mr-2">{field.title.toUpperCase()}
            {field.required ?
                <span className="text-danger"> * </span> : null}
        </label>
    )
}

