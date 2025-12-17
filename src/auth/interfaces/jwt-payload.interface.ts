export interface JwtPayload {
  sub: string;
  correo: string;
  rolId: number;
  iat?: number;
  exp?: number;
}
