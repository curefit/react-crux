import { isEmpty, forEach, flatten, map, filter, concat, uniq } from "lodash"

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
