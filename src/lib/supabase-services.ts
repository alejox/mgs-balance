import { supabase } from "./supabase";
import { Transaction, ConsolidatedPeriod } from "./types";

// Servicios para Transacciones
export const transactionService = {
  // Obtener todas las transacciones del usuario
  async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }

    return data || [];
  },

  // Crear una nueva transacción
  async createTransaction(
    transaction: Omit<Transaction, "id" | "created_at" | "updated_at">
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from("transactions")
      .insert([transaction])
      .select()
      .single();

    if (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }

    return data;
  },

  // Actualizar una transacción
  async updateTransaction(
    id: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }

    return data;
  },

  // Eliminar una transacción
  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  },

  // Eliminar todas las transacciones de un usuario
  async deleteAllTransactions(userId: string): Promise<void> {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting all transactions:", error);
      throw error;
    }
  },
};

// Servicios para Períodos Consolidados
export const consolidatedPeriodService = {
  // Obtener todos los períodos consolidados del usuario
  async getConsolidatedPeriods(userId: string): Promise<ConsolidatedPeriod[]> {
    const { data, error } = await supabase
      .from("consolidated_periods")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching consolidated periods:", error);
      throw error;
    }

    return data || [];
  },

  // Crear un nuevo período consolidado
  async createConsolidatedPeriod(
    period: Omit<ConsolidatedPeriod, "id" | "created_at" | "updated_at">
  ): Promise<ConsolidatedPeriod> {
    const { data, error } = await supabase
      .from("consolidated_periods")
      .insert([period])
      .select()
      .single();

    if (error) {
      console.error("Error creating consolidated period:", error);
      throw error;
    }

    return data;
  },

  // Eliminar un período consolidado
  async deleteConsolidatedPeriod(id: string): Promise<void> {
    const { error } = await supabase
      .from("consolidated_periods")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting consolidated period:", error);
      throw error;
    }
  },
};

// Servicios de autenticación
export const authService = {
  // Obtener el usuario actual
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }

    return user;
  },

  // Iniciar sesión con email y contraseña
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in:", error);
      throw error;
    }

    return data;
  },

  // Registrarse con email y contraseña
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Error signing up:", error);
      throw error;
    }

    return data;
  },

  // Cerrar sesión
  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },
};
