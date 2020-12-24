import * as React from "react"

export const TitleComponent = (props: any) => {
    const { field } = props
    return (
        <label className="small mr-2">{field.title.toUpperCase()}
            {field.required ?
                <span className="text-danger"> * </span> : null}
           {!!field.description ? <span data-tip={field.description} style={{
                background: 'grey',
                color: 'white',
                padding: 5,
                borderRadius: 5
            }}>?</span> : null}
        </label>
    )
}

