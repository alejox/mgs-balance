"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, DollarSign, Calculator, Edit2 } from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { transactionService } from "@/lib/supabase-services";
import { Transaction } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const { user, loading } = useAuthContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amountBs: "",
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

  // Cargar transacciones y precio del USDT al montar el componente
  useEffect(() => {
    if (user && !loading) {
      loadTransactions();
      // Pequeño delay para asegurar que el componente esté completamente montado
      const timer = setTimeout(() => {
        fetchUsdtRate();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  // Función para cargar transacciones desde Supabase
  const loadTransactions = async () => {
    if (!user) return;

    try {
      const data = await transactionService.getTransactions(user.id);
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
      alert("Error al cargar las transacciones");
    }
  };

  // Recalcular USDT cuando cambie el valor de VES/USDT
  useEffect(() => {
    if (newTransaction.amountBs && parseFloat(usdtRate) > 0) {
      const newUsdtAmount = calculateUsdt(newTransaction.amountBs);
      setNewTransaction({
        ...newTransaction,
        amountUsdt: newUsdtAmount,
      });
    }
  }, [usdtRate]);

  const addTransaction = async () => {
    if (!user) {
      alert("Debes iniciar sesión para agregar transacciones");
      return;
    }

    if (!newTransaction.amountBs || !newTransaction.amountUsdt) {
      alert("Por favor completa los montos en bolívares y USDT");
      return;
    }

    try {
      const transactionData = {
        description: `Transacción #${transactions.length + 1}`,
        amountBs:
          newTransaction.type === "expense"
            ? -Math.abs(parseFloat(newTransaction.amountBs))
            : Math.abs(parseFloat(newTransaction.amountBs)),
        amountUsdt:
          newTransaction.type === "expense"
            ? -Math.abs(parseFloat(newTransaction.amountUsdt))
            : Math.abs(parseFloat(newTransaction.amountUsdt)),
        date: new Date().toISOString().split("T")[0],
        type: newTransaction.type,
        user_id: user.id,
      };

      const newTransactionData = await transactionService.createTransaction(
        transactionData
      );
      setTransactions([newTransactionData, ...transactions]);
      setNewTransaction({
        description: "",
        amountBs: "",
        amountUsdt: "",
        type: "income",
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Error al agregar la transacción");
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionService.deleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Error al eliminar la transacción");
    }
  };

  const updateTransaction = async (
    id: string,
    field: keyof Transaction,
    value: string | number
  ) => {
    try {
      const updates = {
        [field]:
          field === "date"
            ? value
            : typeof value === "string"
            ? parseFloat(value) || 0
            : value,
      };

      const updatedTransaction = await transactionService.updateTransaction(
        id,
        updates
      );
      setTransactions(
        transactions.map((t) => (t.id === id ? updatedTransaction : t))
      );
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Error al actualizar la transacción");
    }
  };

  const startEditing = (id: string) => {
    setEditingId(id);
  };

  const stopEditing = () => {
    setEditingId(null);
  };

  // Función para obtener el precio actual del USDT en VES usando Binance P2P
  const fetchUsdtRate = async () => {
    setIsLoadingRate(true);
    try {
      console.log("🔄 Iniciando conexión a través de API route...");

      const response = await fetch("/api/binance", {
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
          const { usdtVesPrice, source, timestamp } = data.data;

          console.log("✅ Precio VES/USDT obtenido:", usdtVesPrice);
          console.log("📊 Fuente:", source);
          console.log("🕒 Timestamp:", timestamp);

          setUsdtRate(usdtVesPrice);
          setConnectionStatus("connected");
          setLastUpdateTime(new Date(timestamp).toLocaleString("es-VE"));
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
      setLastUpdateTime(new Date().toLocaleString("es-VE"));
      // Fallback: usar valor por defecto
      setUsdtRate("180.00");
    } finally {
      setIsLoadingRate(false);
    }
  };

  // Función para calcular USDT automáticamente
  const calculateUsdt = (amountBs: string) => {
    if (!amountBs || !usdtRate) return "";
    const bs = parseFloat(amountBs);
    const rate = parseFloat(usdtRate);
    if (isNaN(bs) || isNaN(rate) || rate === 0) return "";
    const result = bs / rate;
    return result.toFixed(2);
  };

  // Función para manejar cambios en el monto de bolívares
  const handleAmountBsChange = (value: string) => {
    const usdtAmount = calculateUsdt(value);
    setNewTransaction({
      ...newTransaction,
      amountBs: value,
      amountUsdt: usdtAmount,
    });
  };

  const totalBs = transactions.reduce((sum, t) => sum + t.amountBs, 0);
  const totalUsdt = transactions.reduce((sum, t) => sum + t.amountUsdt, 0);
  // Solo calcular comisión sobre ingresos (transacciones positivas)
  const commission =
    transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amountUsdt, 0) * 0.14;

  const formatBs = (amount: number) => {
    const formatted = new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
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

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Debug: Mostrar información del usuario
  console.log("Dashboard - User:", user);
  console.log("Dashboard - Loading:", loading);

  // Redirigir si no hay usuario autenticado
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Requerido
          </h1>
          <p className="text-gray-600 mb-6">
            Debes iniciar sesión para acceder al dashboard
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Debug: No hay usuario autenticado
          </p>
          <a
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard VES</h1>
          <p className="text-gray-600">
            Gestiona tus transacciones en bolívares y USDT
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Usuario: {user.email}</p>
          <button
            onClick={async () => {
              try {
                await supabase.auth.signOut();
                window.location.href = "/auth/login";
              } catch (error) {
                console.error("Error signing out:", error);
              }
            }}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Cerrar Sesión
          </button>
        </div>
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
                    Total en Bolívares
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatBs(totalBs)}
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
                  Valor Actual VES/USDT (Bs)
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={usdtRate}
                  onChange={(e) => {
                    setUsdtRate(e.target.value);
                    // Recalcular USDT si ya hay un monto en bolívares
                    if (newTransaction.amountBs) {
                      const newUsdt = calculateUsdt(newTransaction.amountBs);
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
                    1 USDT = {usdtRate} VES
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
                  valor actual VES/USDT desde Binance P2P
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
                      href="https://www.bcv.org.ve/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 underline hover:text-blue-800"
                    >
                      BCV (USD/VES)
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
                    Monto (Bs)
                  </label>
                  <input
                    type="number"
                    value={newTransaction.amountBs}
                    onChange={(e) => handleAmountBsChange(e.target.value)}
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
                    placeholder="0.00"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Calculado automáticamente
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={addTransaction}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Transacción
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de transacciones */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Transacciones
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Lista de todas tus transacciones con conversión manual a USDT
            </p>
          </div>
          <button
            onClick={() => {
              if (transactions.length > 0) {
                // Crear objeto de período consolidado
                const periodData = {
                  id: Date.now().toString(),
                  transactions: transactions,
                  period: {
                    start:
                      transactions[0]?.date ||
                      new Date().toISOString().split("T")[0],
                    end:
                      transactions[transactions.length - 1]?.date ||
                      new Date().toISOString().split("T")[0],
                  },
                  totalBs: transactions.reduce((sum, t) => sum + t.amountBs, 0),
                  totalUsdt: transactions.reduce(
                    (sum, t) => sum + t.amountUsdt,
                    0
                  ),
                  commission:
                    transactions
                      .filter((t) => t.type === "income")
                      .reduce((sum, t) => sum + t.amountUsdt, 0) * 0.14,
                  createdAt: new Date().toISOString(),
                };

                // Obtener períodos existentes o crear array vacío
                const existingPeriods = JSON.parse(
                  localStorage.getItem("consolidatedPeriods") || "[]"
                );
                existingPeriods.push(periodData);
                localStorage.setItem(
                  "consolidatedPeriods",
                  JSON.stringify(existingPeriods)
                );

                // Resetear dashboard para nuevo período
                setTransactions([]);
                setNewTransaction({
                  description: "",
                  amountBs: "",
                  amountUsdt: "",
                  type: "income",
                });
                setConsolidatedIds(new Set());
                setEditingId(null);
                setUsdtRate("0");

                // Pequeño delay para asegurar que el reset se complete antes de redirigir
                setTimeout(() => {
                  window.location.href = "/dashboard/balances";
                }, 100);
              } else {
                alert("No hay transacciones para consolidar");
              }
            }}
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
                  Monto (Bs)
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
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">
                        {transaction.date}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === transaction.id ? (
                      <input
                        type="number"
                        value={transaction.amountBs}
                        onChange={(e) =>
                          updateTransaction(
                            transaction.id,
                            "amountBs",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                        step="0.01"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`text-sm ${
                          transaction.amountBs < 0
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {formatBs(transaction.amountBs)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === transaction.id ? (
                      <input
                        type="number"
                        value={transaction.amountUsdt}
                        onChange={(e) =>
                          updateTransaction(
                            transaction.id,
                            "amountUsdt",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-black"
                        step="0.01"
                      />
                    ) : (
                      <span
                        className={`text-sm ${
                          transaction.amountUsdt < 0
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {formatUsdt(transaction.amountUsdt)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.type === "income"
                      ? formatUsdt(transaction.amountUsdt * 0.14)
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {editingId === transaction.id ? (
                        <button
                          onClick={stopEditing}
                          className="text-green-600 hover:text-green-900"
                          title="Guardar"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => startEditing(transaction.id)}
                          disabled={consolidatedIds.has(transaction.id)}
                          className={`${
                            consolidatedIds.has(transaction.id)
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-blue-600 hover:text-blue-900"
                          }`}
                          title={
                            consolidatedIds.has(transaction.id)
                              ? "No se puede editar - Transacción consolidada"
                              : "Editar"
                          }
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        disabled={consolidatedIds.has(transaction.id)}
                        className={`${
                          consolidatedIds.has(transaction.id)
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:text-red-900"
                        }`}
                        title={
                          consolidatedIds.has(transaction.id)
                            ? "No se puede eliminar - Transacción consolidada"
                            : "Eliminar"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Fila de totales */}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <strong>TOTAL</strong>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <strong className={totalBs < 0 ? "text-red-600" : ""}>
                    {formatBs(totalBs)}
                  </strong>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <strong className={totalUsdt < 0 ? "text-red-600" : ""}>
                    {formatUsdt(totalUsdt)}
                  </strong>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <strong>{formatUsdt(commission)}</strong>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  -
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
