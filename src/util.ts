import { isEmpty, includes, forEach, flatten, map, filter, concat, uniq } from "lodash"

export function isConditionSatisfied(field: any, model: any): boolean {
    if (Array.isArray(field.conditionalValue)) {
        return includes(field.conditionalValue, model[field.conditionalField])
    } else {
        return field.conditionalValue === model[field.conditionalField]
    }
}

export function getAnchors(field: any): any {
    const anchors: any = {}

    if (field.anchor) {
        anchors[field.anchor] = field
    }

    if (!isEmpty(field.fields)) {
        forEach(field.fields, (field: any) => this.getAnchors(field, anchors))
    }

    if (!isEmpty(field.iterabletype)) {
        this.getAnchors(field.iterabletype, anchors)
    }

    if (!isEmpty(field.nestedtype)) {
        this.getAnchors(field.nestedtype, anchors)
    }
    return anchors
}

export function getAdditionalModelsSingle(field: any): string[] {
    if (field.type === "dynamicTypeahead" || field.type === "dynamicMultiselect") return []
    if (field.modelName) return [field.modelName]
    if (field.additionalModelsOverride) return field.additionalModelsOverride
    if (field.foreign && field.foreign.modelName) return [field.foreign.modelName]
    if (field.type === "nested") return getAdditionalModels(field)
    if (field.type === "iterable" && field.iterabletype) return getAdditionalModelsSingle(field.iterabletype)
    return []
}

export function getAdditionalModels(parent: any): string[] {
    const result: any = flatten(map(parent.fields, (field: any) => getAdditionalModelsSingle(field)))
    const filtered = filter(result, (model: string) => model && model !== "" && !isEmpty(model))
    return uniq((parent.modelName) ? concat(filtered, parent.modelName) : filtered)
}

export function getReadOnly(readonly: boolean | Function, currentModel: any): boolean {
    if (typeof readonly === "function") {
        return readonly(currentModel) === true
    }
    return readonly === true
}
