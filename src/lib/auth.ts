// Sistema de autenticación simple para pruebas
export interface User {
  id: string;
  name: string;
  email: string;
}

// Cuenta de prueba
export const TEST_USER: User = {
  id: "1",
  name: "Usuario Prueba",
  email: "test@balancemgs.com",
};

// Credenciales de prueba
export const TEST_CREDENTIALS = {
  email: "test@balancemgs.com",
  password: "12345678",
};

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<User | null> {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (
      email === TEST_CREDENTIALS.email &&
      password === TEST_CREDENTIALS.password
    ) {
      this.currentUser = TEST_USER;
      // Guardar en localStorage para persistencia
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(TEST_USER));
      }
      return TEST_USER;
    }

    throw new Error("Credenciales inválidas");
  }

  async register(name: string, email: string, password: string): Promise<User> {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Para pruebas, cualquier registro funciona
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
    };

    this.currentUser = newUser;
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(newUser));
    }
    return newUser;
  }

  logout(): void {
    this.currentUser = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Intentar recuperar de localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      }
    }

    return null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = AuthService.getInstance();
