export interface Transaction {
  id: string;
  description: string;
  amountBs: number;
  amountUsdt: number;
  date: string;
  type: "income" | "expense";
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConsolidatedPeriod {
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
  user_id?: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}
