import * as React from "react"
import { Provider } from "react-redux"
import { createStore } from "redux"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { CruxComponentCreator } from "../index"
import { SelectComponent } from "../src/components/SelectComponent"
import { DatePickerComponent } from "../src/components/DatePickerComponent"
import { fetchModel } from "../src/Actions"

describe("React consumer compatibility", () => {
    afterEach(() => vi.restoreAllMocks())

    it("renders existing CRUD list content under Strict Mode", () => {
        const initialState = {
            crux: {
                modalData: {},
                records: [{ _id: "1", name: "Ada Lovelace" }]
            }
        }
        const store = createStore((state = initialState) => state)
        const Records = CruxComponentCreator.create({
            modelName: "records",
            title: "Records",
            creationTitle: "Record",
            fields: [{ display: true, field: "name", title: "Name", type: "text" }]
        })

        render(
            <React.StrictMode>
                <Provider store={store}>
                    <Records />
                </Provider>
            </React.StrictMode>
        )

        expect(screen.getByText("Records")).toBeTruthy()
        expect(screen.getByText("Ada Lovelace")).toBeTruthy()
    })

    it("selects a foreign record through the upgraded dropdown", () => {
        const field = {
            field: "team",
            title: "Team",
            foreign: { modelName: "teams", key: "id", title: "name" }
        }
        const modelChanged = vi.fn()

        render(
            <SelectComponent
                field={field}
                currentModel={undefined}
                additionalModels={{ teams: [{ id: 1, name: "Engineering" }] }}
                parentModel={{}}
                modelChanged={modelChanged}
            />
        )

        fireEvent.click(screen.getByRole("button", { name: "Choose Team" }))
        fireEvent.click(screen.getByText("Engineering"))

        expect(modelChanged).toHaveBeenCalledWith(field, 1)
    })

    it("updates the selected date when a CRUD field receives new props", () => {
        const props = {
            field: { field: "date", title: "Date" },
            currentModel: "2024-01-15T00:00:00.000Z",
            modelChanged: vi.fn(),
            additionalModels: {},
            parentModel: {}
        }
        const { rerender } = render(
            <React.StrictMode>
                <DatePickerComponent {...props} />
            </React.StrictMode>
        )

        expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("January 15, 2024")
        rerender(
            <React.StrictMode>
                <DatePickerComponent {...props} currentModel="2024-02-20T00:00:00.000Z" />
            </React.StrictMode>
        )
        expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("February 20, 2024")
    })

    it("preserves model URL and query parameter encoding", async () => {
        const request = vi.spyOn(globalThis, "fetch").mockResolvedValue({
            status: 200,
            json: async () => ({ results: [] })
        } as Response)
        fetchModel("records?term=hello%20world&token=a=b&tag=a&tag=b#section", undefined, undefined, { extra: "a b" })(vi.fn())

        await waitFor(() => expect(request).toHaveBeenCalledOnce())
        expect(request.mock.calls[0][0]).toBe("/model/records?term=hello%20world&token=a%3Db&tag=a&tag=b&extra=a%20b")
    })
})
