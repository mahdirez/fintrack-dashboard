import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionForm from "./TransactionForm";
import { useFinanceStore } from "../store/useFinanceStore";
import { defaultCategories } from "../utils/defaultCategories";

beforeEach(() => {
  useFinanceStore.setState({
    transactions: [],
    categories: defaultCategories,
    budgets: [],
  });
});

describe("TransactionForm", () => {
  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<TransactionForm onSuccess={onSuccess} />);

    await user.click(screen.getByRole("button", { name: /add transaction/i }));

    expect(
      await screen.findByText(/title must be at least 2 characters/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
    expect(screen.getByText(/please select a category/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(useFinanceStore.getState().transactions).toHaveLength(0);
  });

  it("adds a transaction when the form is valid", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<TransactionForm onSuccess={onSuccess} />);

    await user.type(
      screen.getByPlaceholderText(/grocery shopping/i),
      "Groceries",
    );
    await user.type(screen.getByPlaceholderText("0.00"), "45.5");
    await user.selectOptions(screen.getByRole("combobox"), "food");
    await user.click(screen.getByRole("button", { name: /add transaction/i }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled());

    const [t] = useFinanceStore.getState().transactions;
    expect(t).toMatchObject({
      title: "Groceries",
      amount: 45.5,
      type: "expense",
      categoryId: "food",
    });
  });

  it("only lists categories matching the selected type", async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSuccess={() => {}} />);

    expect(screen.getByRole("option", { name: "Food" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Salary" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^income$/i }));

    expect(screen.getByRole("option", { name: "Salary" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Food" }),
    ).not.toBeInTheDocument();
  });
});
