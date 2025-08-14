"use client";

import { useState, useEffect } from "react";
import { FileText, DollarSign, Calculator, TrendingUp } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  amountBs: number;
  amountUsdt: number;
  date: string;
  type: "income" | "expense";
}

interface PeriodData {
  id: string;
  transactions: Transaction[];
  period: {
    start: string;
    end: string;
  };
  totalBs: number;
  totalUsdt: number;
  commission: number;
  createdAt: string;
}

export default function BalancesPage() {
  const [consolidatedPeriods, setConsolidatedPeriods] = useState<PeriodData[]>(
    []
  );
  const [showConsolidated, setShowConsolidated] = useState(false);

  useEffect(() => {
    const storedPeriods = localStorage.getItem("consolidatedPeriods");
    if (storedPeriods) {
      const periods = JSON.parse(storedPeriods);
      setConsolidatedPeriods(periods);
      setShowConsolidated(periods.length > 0);
    }
  }, []);

  const clearConsolidatedData = () => {
    localStorage.removeItem("consolidatedPeriods");
    setConsolidatedPeriods([]);
    setShowConsolidated(false);
  };

  const deletePeriod = (periodId: string) => {
    const updatedPeriods = consolidatedPeriods.filter((p) => p.id !== periodId);
    setConsolidatedPeriods(updatedPeriods);
    localStorage.setItem("consolidatedPeriods", JSON.stringify(updatedPeriods));
    if (updatedPeriods.length === 0) {
      setShowConsolidated(false);
    }
  };

  const formatBs = (amount: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatUsdt = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calcular totales generales
  const getGeneralTotals = () => {
    if (consolidatedPeriods.length === 0) return null;

    const totalBs = consolidatedPeriods.reduce(
      (sum, period) => sum + period.totalBs,
      0
    );
    const totalUsdt = consolidatedPeriods.reduce(
      (sum, period) => sum + period.totalUsdt,
      0
    );
    const totalCommission = consolidatedPeriods.reduce(
      (sum, period) => sum + period.commission,
      0
    );

    return {
      totalBs,
      totalUsdt,
      totalCommission,
    };
  };

  const generalTotals = getGeneralTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Balances</h1>
          <p className="text-gray-600">
            Períodos consolidados desde el Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          {/* Botón eliminado - Los períodos se gestionan individualmente */}
        </div>
      </div>

      {/* Cards de Total General y Comisiones */}
      {generalTotals && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total General (Bs)
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatBs(generalTotals.totalBs)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calculator className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total General (USDT)
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatUsdt(generalTotals.totalUsdt)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Comisiones Totales
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatUsdt(generalTotals.totalCommission)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay datos consolidados */}
      {!showConsolidated && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-12 sm:px-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay transacciones consolidadas
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Ve al Dashboard y usa el botón &ldquo;Consolidar&rdquo; para
              enviar transacciones aquí.
            </p>
          </div>
        </div>
      )}

      {/* Períodos Consolidados */}
      {showConsolidated && (
        <div className="space-y-6">
          {consolidatedPeriods.map((period, periodIndex) => (
            <div
              key={period.id}
              className="bg-white shadow overflow-hidden sm:rounded-md"
            >
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-green-600" />
                    Período {periodIndex + 1}: {period.period.start} -{" "}
                    {period.period.end}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {period.transactions.length} transacciones | Total:{" "}
                    {formatBs(period.totalBs)} | {formatUsdt(period.totalUsdt)}{" "}
                    | Comisión: {formatUsdt(period.commission)}
                  </p>
                </div>
                <button
                  onClick={() => deletePeriod(period.id)}
                  className="text-red-600 hover:text-red-900 p-1"
                  title="Eliminar período"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transacción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto (Bs)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto (USDT)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comisión (14%)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {period.transactions.map((transaction, index) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.type === "income"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.type === "income"
                              ? "Ingreso"
                              : "Gasto"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatBs(transaction.amountBs)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatUsdt(transaction.amountUsdt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.type === "income"
                            ? formatUsdt(transaction.amountUsdt * 0.14)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                    {/* Fila de totales del período */}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <strong>TOTAL PERÍODO</strong>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-900">
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <strong>{formatBs(period.totalBs)}</strong>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <strong>{formatUsdt(period.totalUsdt)}</strong>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <strong>{formatUsdt(period.commission)}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
