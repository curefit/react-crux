import * as _ from "lodash"

export function getAnchors(field: any): any {
    const anchors: any = {}

    if (field.anchor) {
        anchors[field.anchor] = field
    }

    if (!_.isEmpty(field.fields)) {
        _.forEach(field.fields, (field: any) => this.getAnchors(field, anchors))
    }

    if (!_.isEmpty(field.iterabletype)) {
        this.getAnchors(field.iterabletype, anchors)
    }

    if (!_.isEmpty(field.nestedtype)) {
        this.getAnchors(field.nestedtype, anchors)
    }
    return anchors
}

export function getAdditionalModelsSingle(field: any): string[] {
    if (field.type === "dynamicTypeahead") return []
    if (field.modelName) return [field.modelName]
    if (field.additionalModelsOverride) return field.additionalModelsOverride
    if (field.foreign && field.foreign.modelName) return [field.foreign.modelName]
    if (field.type === "nested") return getAdditionalModels(field)
    if (field.type === "iterable" && field.iterabletype) return getAdditionalModelsSingle(field.iterabletype)
    return []
}

export function getAdditionalModels(parent: any): string[] {
    const result: any = _.flatten(_.map(parent.fields, (field: any) => getAdditionalModelsSingle(field)))
    const filtered = _.filter(result, (model: string) => model && model !== "" && !_.isEmpty(model))
    return _.uniq((parent.modelName) ? _.concat(filtered, parent.modelName) : filtered)
}

export function getReadOnly(readonly: boolean | Function, currentModel: any): boolean {
    if (typeof readonly === "function") {
        return readonly(currentModel) === true
    }
    return readonly === true
}
