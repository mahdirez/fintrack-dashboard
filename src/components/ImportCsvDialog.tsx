import { useState, type ChangeEvent } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { useToastStore } from "../store/useToastStore";
import {
  MAX_FILE_SIZE,
  importTransactionsFromCSV,
  type ImportResult,
} from "../utils/importCsv";

interface Props {
  onClose: () => void;
}

function failure(message: string): ImportResult {
  return { valid: [], duplicates: 0, errors: [], fatalError: message };
}

export default function ImportCsvDialog({ onClose }: Props) {
  const categories = useFinanceStore((s) => s.categories);
  const transactions = useFinanceStore((s) => s.transactions);
  const addTransactions = useFinanceStore((s) => s.addTransactions);
  const deleteTransactions = useFinanceStore((s) => s.deleteTransactions);
  const showToast = useToastStore((s) => s.showToast);

  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; 
    if (!file) return;

    setFileName(file.name);

    if (file.size > MAX_FILE_SIZE) {
      setResult(failure("File is too large (max 1 MB)."));
      return;
    }

    try {
      const text = await file.text();
      setResult(importTransactionsFromCSV(text, categories, transactions));
    } catch {
      setResult(failure("Could not read the file."));
    }
  };

  const handleImport = () => {
    if (!result || result.valid.length === 0) return;

    const ids = addTransactions(result.valid);
    const count = ids.length;

    showToast({
      message: `Imported ${count} ${count === 1 ? "transaction" : "transactions"}`,
      actionLabel: "Undo",
      onAction: () => deleteTransactions(ids),
    });
    onClose();
  };

  const canImport =
    result !== null && !result.fatalError && result.valid.length > 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Choose a CSV file with the columns{" "}
        <code className="rounded bg-gray-100 px-1">
          Date, Title, Type, Category, Amount, Note
        </code>
        . Files exported from FinTrack work as-is.
      </p>

      <label className="block">
        <span className="sr-only">CSV file</span>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-600 hover:file:bg-indigo-100"
        />
      </label>

      {result?.fatalError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {result.fatalError}
        </p>
      )}

      {result && !result.fatalError && (
        <div className="space-y-3">
          <p className="truncate text-xs text-gray-500">{fileName}</p>

          <dl className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-green-50 p-3">
              <dd className="text-xl font-semibold text-green-700">
                {result.valid.length}
              </dd>
              <dt className="text-xs text-gray-500">To import</dt>
            </div>
            <div className="rounded-lg bg-gray-100 p-3">
              <dd className="text-xl font-semibold">{result.duplicates}</dd>
              <dt className="text-xs text-gray-500">Duplicates</dt>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <dd className="text-xl font-semibold text-red-700">
                {result.errors.length}
              </dd>
              <dt className="text-xs text-gray-500">Errors</dt>
            </div>
          </dl>

          {result.errors.length > 0 && (
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-3 text-xs text-gray-600">
              {result.errors.slice(0, 10).map((err) => (
                <li key={err.row}>
                  <span className="font-medium">Row {err.row}:</span>{" "}
                  {err.message}
                </li>
              ))}
              {result.errors.length > 10 && (
                <li className="text-gray-400">
                  …and {result.errors.length - 10} more
                </li>
              )}
            </ul>
          )}

          {result.errors.length > 0 && result.valid.length > 0 && (
            <p className="text-xs text-gray-500">
              Rows with errors will be skipped.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleImport}
          disabled={!canImport}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canImport ? `Import ${result.valid.length}` : "Import"}
        </button>
      </div>
    </div>
  );
}
