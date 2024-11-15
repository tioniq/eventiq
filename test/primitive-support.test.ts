import { MutableVariable } from "../src"

describe("primitive support", () => {
  it("numbers", () => {
    const v1 = new MutableVariable(10)
    // biome-ignore lint/suspicious/noExplicitAny: for testing valueOf override
    expect(((v1 as any) + 10) as any).toBe(20)
  })
})
