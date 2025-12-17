export interface AuthResponse {
  data: {
    id: string;
    correo: string;
    nombre: string;
    apellido: string;
    rol: {
      id: number;
      nombre: string;
    };
  };
  accessToken: string;
}
