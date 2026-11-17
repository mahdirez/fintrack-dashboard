import { parseCSV } from "./csvParser";
import { transactionsToCSV } from "./csv";
import { defaultCategories } from "./defaultCategories";
import { importTransactionsFromCSV } from "./importCsv";
import { makeTransaction } from "../test/factories";

const HEADER = "Date,Title,Type,Category,Amount,Note";

describe("parseCSV", () => {
  it("parses quotes, escaped quotes, commas and newlines inside cells", () => {
    const rows = parseCSV('a,"b, ""c""","line1\nline2"\r\nx,y,z');
    expect(rows).toEqual([
      ["a", 'b, "c"', "line1\nline2"],
      ["x", "y", "z"],
    ]);
  });

  it("strips BOM and ignores empty lines", () => {
    expect(parseCSV("\uFEFFa,b\n\n\nc,d\n")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });
});

describe("importTransactionsFromCSV", () => {
  it("imports valid rows", () => {
    const csv = `${HEADER}\n2026-11-02,Lunch,expense,Food,12.50,tasty`;
    const result = importTransactionsFromCSV(csv, defaultCategories, []);

    expect(result.errors).toEqual([]);
    expect(result.valid).toEqual([
      {
        title: "Lunch",
        amount: 12.5,
        type: "expense",
        categoryId: "food",
        date: "2026-11-02",
        note: "tasty",
      },
    ]);
  });

  it("works with reordered columns and without the Note column", () => {
    const csv =
      "Amount,Category,Type,Title,Date\n20,salary,income,Bonus,2026-11-01";
    const result = importTransactionsFromCSV(csv, defaultCategories, []);
    expect(result.valid).toHaveLength(1);
    expect(result.valid[0]).toMatchObject({ categoryId: "salary", amount: 20 });
  });

  it("reports a fatal error for missing columns or empty files", () => {
    expect(
      importTransactionsFromCSV("", defaultCategories, []).fatalError,
    ).toBeTruthy();
    expect(
      importTransactionsFromCSV(
        "Date,Title\n2026-11-01,x",
        defaultCategories,
        [],
      ).fatalError,
    ).toMatch(/missing columns/i);
  });

  it("collects row errors and keeps the valid rows", () => {
    const csv = [
      HEADER,
      "2026-02-30,Bad date,expense,Food,10,",
      "2026-11-02,A,expense,Food,10,", 
      "2026-11-02,Bad type,transfer,Food,10,",
      "2026-11-02,Ghost,expense,Nope,10,", 
      "2026-11-02,Negative,expense,Food,-5,",
      "2026-11-02,Good row,expense,Food,10,",
    ].join("\n");

    const result = importTransactionsFromCSV(csv, defaultCategories, []);

    expect(result.valid).toHaveLength(1);
    expect(result.errors.map((e) => e.row)).toEqual([1, 2, 3, 4, 5]);
  });

  it("does not match a category of the wrong type", () => {
    const csv = `${HEADER}\n2026-11-02,Oops,income,Food,10,`;
    const result = importTransactionsFromCSV(csv, defaultCategories, []);
    expect(result.valid).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
  });

  it("skips duplicates of existing transactions but keeps genuine repeats", () => {
    const existing = [
      makeTransaction({
        title: "Coffee",
        amount: 4,
        categoryId: "food",
        date: "2026-11-02",
      }),
    ];
    const row = "2026-11-02,Coffee,expense,Food,4.00,";
    const csv = `${HEADER}\n${row}\n${row}`;

    const result = importTransactionsFromCSV(csv, defaultCategories, existing);

    expect(result.duplicates).toBe(1);
    expect(result.valid).toHaveLength(1);
  });

  it("round-trips data produced by transactionsToCSV", () => {
    const source = [
      makeTransaction({
        title: 'Lunch, with "friends"',
        amount: 12.5,
        date: "2026-11-02",
        note: "a\nb",
      }),
      makeTransaction({ title: "=1+1", amount: 3, date: "2026-11-03" }),
      makeTransaction({
        title: "Salary",
        type: "income",
        categoryId: "salary",
        amount: 1000,
        date: "2026-11-01",
      }),
    ];

    const csv = transactionsToCSV(source, defaultCategories);
    const result = importTransactionsFromCSV(csv, defaultCategories, []);

    expect(result.errors).toEqual([]);
    expect(result.valid).toEqual(
      source.map((t) => ({
        title: t.title,
        amount: t.amount,
        type: t.type,
        categoryId: t.categoryId,
        date: t.date,
        note: t.note,
      })),
    );
  });
});
