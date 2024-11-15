import { EventObserverStub } from "../../src"
import { emptyDisposable } from "@tioniq/disposiq"

describe("stub", () => {
  it("subscribe should return empty disposable", () => {
    const stub = new EventObserverStub()
    expect(stub.subscribe()).toEqual(emptyDisposable)
  })
})
