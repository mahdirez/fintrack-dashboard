import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const BudgetsPage = lazy(() => import("./pages/BudgetsPage"));

function App() {
  return (
    <Suspense
      fallback={<p className="p-6 text-sm text-gray-500">Loading...</p>}
    >
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
