import { getCategoryUsage, isDuplicateCategoryName } from "./categories";
import { defaultCategories } from "./defaultCategories";
import { makeTransaction } from "../test/factories";

describe("getCategoryUsage", () => {
  it("counts transactions per category", () => {
    const usage = getCategoryUsage([
      makeTransaction({ categoryId: "food" }),
      makeTransaction({ categoryId: "food" }),
      makeTransaction({ categoryId: "transport" }),
    ]);
    expect(usage.get("food")).toBe(2);
    expect(usage.get("transport")).toBe(1);
    expect(usage.get("health")).toBeUndefined();
  });
});

describe("isDuplicateCategoryName", () => {
  it("detects duplicates case-insensitively within the same type", () => {
    expect(
      isDuplicateCategoryName(defaultCategories, " food ", "expense"),
    ).toBe(true);
  });

  it("allows the same name in a different type", () => {
    expect(isDuplicateCategoryName(defaultCategories, "Food", "income")).toBe(
      false,
    );
  });

  it("ignores the category being edited", () => {
    expect(
      isDuplicateCategoryName(defaultCategories, "Food", "expense", "food"),
    ).toBe(false);
  });
});
