import { expect, test, describe } from "bun:test";
import { criteriaToString } from "../index";

describe("Object 用例", () => {
  test("Object-1", () => {
    const criterias = {
      id: ["1", "2"],
    };
    expect(criteriaToString(criterias)).toBe("((id in ('1', '2')))");
  });
});
