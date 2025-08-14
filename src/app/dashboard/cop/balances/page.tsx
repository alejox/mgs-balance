"use client";

import { useState, useEffect } from "react";
import { DollarSign, Calculator, TrendingUp } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  amountCop: number;
  amountUsdt: number;
  date: string;
  type: "income" | "expense";
}

export default function CopBalancesPage() {
  const [consolidatedPeriods, setConsolidatedPeriods] = useState<
    Array<{
      id: string;
      description: string;
      transactions: Transaction[];
      totalCop: number;
      totalUsdt: number;
      commission: number;
      date: string;
    }>
  >([]);

  const [totalGeneralCop, setTotalGeneralCop] = useState(0);
  const [totalGeneralUsdt, setTotalGeneralUsdt] = useState(0);
  const [comisionesTotales, setComisionesTotales] = useState(0);

  useEffect(() => {
    // Cargar datos consolidados desde localStorage
    const savedData = localStorage.getItem("consolidatedCopData");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setConsolidatedPeriods(data.periods || []);
        setTotalGeneralCop(data.totalGeneralCop || 0);
        setTotalGeneralUsdt(data.totalGeneralUsdt || 0);
        setComisionesTotales(data.comisionesTotales || 0);
      } catch (error) {
        console.error("Error loading consolidated data:", error);
      }
    }
  }, []);

  const formatCop = (amount: number) => {
    const formatted = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));

    return amount < 0 ? `-${formatted}` : formatted;
  };

  const formatUsdt = (amount: number) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));

    return amount < 0 ? `-${formatted}` : formatted;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Balances COP</h1>
        <p className="text-gray-600">
          Resumen de transacciones consolidadas en Pesos Colombianos (COP) y
          USDT
        </p>
      </div>

      {/* Cards de totales generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total General (COP)
              </p>
              <p
                className={`text-2xl font-bold ${
                  totalGeneralCop < 0 ? "text-red-600" : "text-gray-900"
                }`}
              >
                {formatCop(totalGeneralCop)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total General (USDT)
              </p>
              <p
                className={`text-2xl font-bold ${
                  totalGeneralUsdt < 0 ? "text-red-600" : "text-gray-900"
                }`}
              >
                {formatUsdt(totalGeneralUsdt)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calculator className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Comisiones Totales
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatUsdt(comisionesTotales)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de períodos consolidados */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Períodos Consolidados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto (COP)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto (USDT)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisión (14%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {consolidatedPeriods.map((period) => (
                <tr key={period.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {period.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        period.totalCop >= 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {period.totalCop >= 0 ? "Ingreso" : "Gasto"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${
                        period.totalCop < 0 ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {formatCop(period.totalCop)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${
                        period.totalUsdt < 0 ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {formatUsdt(period.totalUsdt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {period.totalUsdt >= 0
                        ? formatUsdt(period.totalUsdt * 0.14)
                        : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(period.date).toLocaleDateString("es-CO")}
                    </div>
                  </td>
                </tr>
              ))}
              {/* Fila de totales */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  TOTAL GENERAL
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    {totalGeneralCop >= 0 ? "Ingreso" : "Gasto"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`text-sm font-semibold ${
                      totalGeneralCop < 0 ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {formatCop(totalGeneralCop)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`text-sm font-semibold ${
                      totalGeneralUsdt < 0 ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {formatUsdt(totalGeneralUsdt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatUsdt(comisionesTotales)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">-</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
