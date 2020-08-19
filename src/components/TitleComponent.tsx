import * as React from "react"
import ReactTooltip from 'react-tooltip';

export const TitleComponent = (props: any) => {
    const { field } = props
    return (
        <label className="small mr-2">{field.title.toUpperCase()}
            {field.required ?
                <span className="text-danger" style={{
                    fontSize: 24,
                    position: 'absolute',
                    marginTop: -4,
                    marginLeft: 2
                }}> * </span> : null}
            {!!field.description ? <span data-tip={field.description} style={{
                borderRadius: 10,
                marginLeft: 8,
                background: 'white',
                color: 'black',
                padding: 4,
                border: '1px solid'
            }}>?</span> : null}
            <ReactTooltip />
        </label>
    )
}

