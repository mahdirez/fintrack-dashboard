import { useToastStore } from "./useToastStore";

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
});

describe("useToastStore", () => {
  it("adds a toast with a generated id", () => {
    useToastStore.getState().showToast({ message: "Hello" });
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe("Hello");
    expect(toasts[0].id).toBeTruthy();
  });

  it("dismisses a toast by id", () => {
    useToastStore.getState().showToast({ message: "A" });
    const [toast] = useToastStore.getState().toasts;
    useToastStore.getState().dismissToast(toast.id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("keeps only the 3 most recent toasts", () => {
    const { showToast } = useToastStore.getState();
    ["1", "2", "3", "4"].forEach((message) => showToast({ message }));

    const messages = useToastStore.getState().toasts.map((t) => t.message);
    expect(messages).toEqual(["2", "3", "4"]);
  });
});
