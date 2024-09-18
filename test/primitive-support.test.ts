import {MutableVariable} from "../src";

describe('primitive support', () => {
  it("numbers", () => {
    const v1 = new MutableVariable(10)
    expect((v1 as any + 10) as any).toBe(20)
  })
});