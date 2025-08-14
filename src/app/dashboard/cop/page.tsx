"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  Calculator,
} from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  amountCop: number;
  amountUsdt: number;
  date: string;
  type: "income" | "expense"; // 'income' para ingresos, 'expense' para gastos
}

export default function DashboardCopPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amountCop: "",
    amountUsdt: "",
    type: "income" as "income" | "expense",
  });

  const [usdtRate, setUsdtRate] = useState("0"); // Valor por defecto del USDT
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connected" | "error"
  >("idle");
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [consolidatedIds, setConsolidatedIds] = useState<Set<string>>(
    new Set()
  );

  // Cargar precio del USDT al montar el componente
  useEffect(() => {
    // Pequeño delay para asegurar que el componente esté completamente montado
    const timer = setTimeout(() => {
      fetchUsdtRate();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Recalcular USDT cuando cambie el valor de COP/USDT
  useEffect(() => {
    if (newTransaction.amountCop && parseFloat(usdtRate) > 0) {
      const newUsdtAmount = calculateUsdt(newTransaction.amountCop);
      setNewTransaction({
        ...newTransaction,
        amountUsdt: newUsdtAmount,
      });
    }
  }, [usdtRate]);

  // Función para obtener el precio actual del USDT en COP usando Binance P2P
  const fetchUsdtRate = async () => {
    setIsLoadingRate(true);
    try {
      console.log("🔄 Iniciando conexión a través de API route...");

      const response = await fetch("/api/binance-cop", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000), // 10 segundos timeout
      });

      console.log(
        "📡 Respuesta de API route:",
        response.status,
        response.statusText
      );

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Datos de API route:", data);

        if (data.success && data.data) {
          const { usdtCopPrice, source, timestamp } = data.data;

          console.log("✅ Precio COP/USDT obtenido:", usdtCopPrice);
          console.log("📊 Fuente:", source);
          console.log("🕒 Timestamp:", timestamp);

          setUsdtRate(usdtCopPrice);
          setConnectionStatus("connected");
          setLastUpdateTime(new Date(timestamp).toLocaleString("es-CO"));
        } else {
          throw new Error(data.error || "Error en respuesta de API");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error obteniendo precio desde API route:", error);
      setConnectionStatus("error");
      setLastUpdateTime(new Date().toLocaleString("es-CO"));
      // Fallback: usar valor por defecto
      setUsdtRate("4000.00");
    } finally {
      setIsLoadingRate(false);
    }
  };

  const addTransaction = () => {
    if (!newTransaction.description || !newTransaction.amountCop) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      description: newTransaction.description,
      amountCop: parseFloat(newTransaction.amountCop),
      amountUsdt: parseFloat(newTransaction.amountUsdt || "0"),
      date: new Date().toISOString().split("T")[0],
      type: newTransaction.type,
    };

    // Si es un gasto, hacer los montos negativos
    if (transaction.type === "expense") {
      transaction.amountCop = -Math.abs(transaction.amountCop);
      transaction.amountUsdt = -Math.abs(transaction.amountUsdt);
    }

    setTransactions([...transactions, transaction]);
    setNewTransaction({
      description: "",
      amountCop: "",
      amountUsdt: "",
      type: "income",
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const updateTransaction = (
    id: string,
    field: keyof Transaction,
    value: string | number
  ) => {
    setTransactions(
      transactions.map((t) =>
        t.id === id
          ? {
              ...t,
              [field]:
                field === "date"
                  ? value
                  : typeof value === "string"
                  ? parseFloat(value) || 0
                  : value,
            }
          : t
      )
    );
  };

  const startEditing = (id: string) => {
    setEditingId(id);
  };

  const stopEditing = () => {
    setEditingId(null);
  };

  // Función para calcular USDT automáticamente
  const calculateUsdt = (amountCop: string) => {
    if (!amountCop || !usdtRate) return "";
    const cop = parseFloat(amountCop);
    const rate = parseFloat(usdtRate);
    if (isNaN(cop) || isNaN(rate) || rate === 0) return "";
    const result = cop / rate;
    return result.toFixed(2);
  };

  // Función para manejar cambios en el monto de pesos colombianos
  const handleAmountCopChange = (value: string) => {
    const usdtAmount = calculateUsdt(value);
    setNewTransaction({
      ...newTransaction,
      amountCop: value,
      amountUsdt: usdtAmount,
    });
  };

  const totalCop = transactions.reduce((sum, t) => sum + t.amountCop, 0);
  const totalUsdt = transactions.reduce((sum, t) => sum + t.amountUsdt, 0);
  // Solo calcular comisión sobre ingresos (transacciones positivas)
  const commission =
    transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amountUsdt, 0) * 0.14;

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

  const consolidate = () => {
    if (transactions.length > 0) {
      // Crear objeto de período consolidado
      const periodData = {
        id: Date.now().toString(),
        transactions: transactions,
        period: {
          start:
            transactions[0]?.date || new Date().toISOString().split("T")[0],
          end:
            transactions[transactions.length - 1]?.date ||
            new Date().toISOString().split("T")[0],
        },
        totalCop: transactions.reduce((sum, t) => sum + t.amountCop, 0),
        totalUsdt: transactions.reduce((sum, t) => sum + t.amountUsdt, 0),
        commission:
          transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amountUsdt, 0) * 0.14,
        createdAt: new Date().toISOString(),
      };

      // Obtener períodos existentes o crear array vacío
      const existingPeriods = JSON.parse(
        localStorage.getItem("consolidatedCopData") || "[]"
      );
      existingPeriods.push(periodData);
      localStorage.setItem(
        "consolidatedCopData",
        JSON.stringify(existingPeriods)
      );

      // Resetear dashboard para nuevo período
      setTransactions([]);
      setNewTransaction({
        description: "",
        amountCop: "",
        amountUsdt: "",
        type: "income",
      });
      setConsolidatedIds(new Set());
      setEditingId(null);
      setUsdtRate("0");

      // Pequeño delay para asegurar que el reset se complete antes de redirigir
      setTimeout(() => {
        window.location.href = "/dashboard/cop/balances";
      }, 100);
    } else {
      alert("No hay transacciones para consolidar");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard COP</h1>
        <p className="text-gray-600">
          Gestiona tus transacciones en Pesos Colombianos (COP) y USDT
        </p>
      </div>

      {/* Resumen de totales */}
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
                    Total en Pesos Colombianos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCop(totalCop)}
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
                    Total en USDT
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatUsdt(totalUsdt)}
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
                <svg
                  className="h-6 w-6 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Comisión (14%)
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatUsdt(commission)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario para agregar transacción */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Agregar Nueva Transacción
          </h3>

          {/* Input para el valor del USDT */}
          <div className="space-y-6">
            {/* Valor del USDT */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Valor Actual COP/USDT
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={usdtRate}
                  onChange={(e) => {
                    setUsdtRate(e.target.value);
                    // Recalcular USDT si ya hay un monto en pesos colombianos
                    if (newTransaction.amountCop) {
                      const newUsdt = calculateUsdt(newTransaction.amountCop);
                      setNewTransaction({
                        ...newTransaction,
                        amountUsdt: newUsdt,
                      });
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="0"
                  step="0.01"
                />
                <button
                  onClick={fetchUsdtRate}
                  disabled={isLoadingRate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoadingRate ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </div>
                  ) : (
                    "Actualizar Precio"
                  )}
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 font-medium">
                    1 USDT = {usdtRate} COP
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      connectionStatus === "connected"
                        ? "bg-green-500"
                        : connectionStatus === "error"
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                    title={
                      connectionStatus === "connected"
                        ? "Conectado a Binance"
                        : connectionStatus === "error"
                        ? "Error de conexión"
                        : "Conectando..."
                    }
                  ></div>
                </div>
                {lastUpdateTime && (
                  <div className="mt-1 text-xs text-gray-500">
                    <span className="block">Actualizado: {lastUpdateTime}</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <p>
                  💡 Haz clic en &ldquo;Actualizar Precio&rdquo; para obtener el
                  valor actual COP/USDT desde Binance P2P
                </p>
                {connectionStatus === "connected" && (
                  <p className="mt-1 text-green-600">
                    ✅ Conectado a Binance P2P
                  </p>
                )}
                {connectionStatus === "error" && (
                  <p className="mt-1 text-red-600">
                    ❌ Error de conexión. Usando valor por defecto.
                  </p>
                )}

                <div className="mt-2 space-y-1">
                  <span className="block text-xs text-blue-600">
                    🔍 Verificar en:
                    <a
                      href="https://p2p.binance.com/en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 underline hover:text-blue-800"
                    >
                      Binance P2P
                    </a>{" "}
                    |
                    <a
                      href="https://coinmarketcap.com/currencies/tether/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 underline hover:text-blue-800"
                    >
                      USDT Price
                    </a>{" "}
                    |
                    <a
                      href="https://www.dolar-colombia.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 underline hover:text-blue-800"
                    >
                      Dólar Colombia
                    </a>
                  </span>
                </div>
              </div>
            </div>

            {/* Formulario de transacción */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Nueva Transacción
              </h4>

              {/* Selector de tipo de transacción */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Transacción
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="transactionType"
                      value="income"
                      checked={newTransaction.type === "income"}
                      onChange={(e) =>
                        setNewTransaction({
                          ...newTransaction,
                          type: e.target.value as "income" | "expense",
                        })
                      }
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Ingreso (+)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="transactionType"
                      value="expense"
                      checked={newTransaction.type === "expense"}
                      onChange={(e) =>
                        setNewTransaction({
                          ...newTransaction,
                          type: e.target.value as "income" | "expense",
                        })
                      }
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Gasto/Adelanto (-)
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto (COP)
                  </label>
                  <input
                    type="number"
                    value={newTransaction.amountCop}
                    onChange={(e) => handleAmountCopChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto (USDT)
                  </label>
                  <input
                    type="number"
                    value={newTransaction.amountUsdt}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amountUsdt: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Descripción de la transacción"
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={addTransaction}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Agregar Transacción
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de transacciones */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Transacciones
            </h3>
            <button
              onClick={consolidate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Consolidar
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
                    Monto (COP)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto (USDT)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comisión (14%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className={`hover:bg-gray-50 ${
                      consolidatedIds.has(transaction.id) ? "bg-green-50" : ""
                    }`}
                  >
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
                        {transaction.type === "income" ? "Ingreso" : "Gasto"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === transaction.id ? (
                        <input
                          type="date"
                          value={transaction.date}
                          onChange={(e) =>
                            updateTransaction(
                              transaction.id,
                              "date",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-black"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {new Date(transaction.date).toLocaleDateString(
                            "es-CO"
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === transaction.id ? (
                        <input
                          type="number"
                          value={Math.abs(transaction.amountCop)}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            const sign =
                              transaction.type === "expense" ? -1 : 1;
                            updateTransaction(
                              transaction.id,
                              "amountCop",
                              value * sign
                            );
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-black"
                          step="0.01"
                        />
                      ) : (
                        <div
                          className={`text-sm font-medium ${
                            transaction.amountCop < 0
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {formatCop(transaction.amountCop)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === transaction.id ? (
                        <input
                          type="number"
                          value={Math.abs(transaction.amountUsdt)}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            const sign =
                              transaction.type === "expense" ? -1 : 1;
                            updateTransaction(
                              transaction.id,
                              "amountUsdt",
                              value * sign
                            );
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-black"
                          step="0.01"
                        />
                      ) : (
                        <div
                          className={`text-sm font-medium ${
                            transaction.amountUsdt < 0
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {formatUsdt(transaction.amountUsdt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.type === "income"
                          ? formatUsdt(transaction.amountUsdt * 0.14)
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingId === transaction.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={stopEditing}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={stopEditing}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(transaction.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {/* Fila de totales */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    TOTAL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        totalCop >= 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {totalCop >= 0 ? "Ingreso" : "Gasto"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">-</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-semibold ${
                        totalCop < 0 ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {formatCop(totalCop)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-semibold ${
                        totalUsdt < 0 ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {formatUsdt(totalUsdt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatUsdt(commission)}
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
    </div>
  );
}
