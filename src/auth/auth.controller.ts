import { Controller, Get, Req, Res, Session } from '@nestjs/common';
import type { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MsalConfigService } from './msal.config';
import { IdTokenClaims } from '@azure/msal-node';
import { JwtService } from '@nestjs/jwt';
import { Public } from './decorators/public.decorator';
import { appConfig } from '@/config/app.config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly msalConfig: MsalConfigService,
  ) {}

  @Public()
  @Get('login')
  login(@Session() session: Record<string, any>, @Res() res: Response) {
    const state = uuidv4();
    const nonce = uuidv4();

    session.authState = state;
    session.nonce = nonce;

    const msal = this.msalConfig.getInstance();
    const authCodeUrlParams = {
      scopes: ['openid', 'profile', 'email', 'User.Read'],
      redirectUri: `${appConfig.urlBackend}/auth/callback`,
      state,
      nonce,
      prompt: 'select_account',
    };

    msal
      .getAuthCodeUrl(authCodeUrlParams)
      .then((url) => res.redirect(url))
      .catch((error) => res.status(500).send(`Login failed: ${error}`));
  }

  @Public()
  @Get('callback')
  async callback(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${appConfig.urlFrontend}/login?error=${error as string}`);
    }

    if (state !== session.authState) {
      return res.status(401).send('State mismatch');
    }

    try {
      const msal = this.msalConfig.getInstance();
      const tokenRequest = {
        code: code as string,
        scopes: ['openid', 'profile', 'email', 'User.Read'],
        redirectUri: `${appConfig.urlBackend}/auth/callback`,
        nonce: session.nonce,
      };

      const response = await msal.acquireTokenByCode(tokenRequest);

      const idToken = response.idTokenClaims as IdTokenClaims;
      console.log('response', response);
      console.log('idToken', idToken);

      // ✅ Verifica que el usuario pertenece a tu tenant (Office 365)
      if (idToken?.tid !== appConfig.azureAdTenantId) {
        return res.status(403).send('Usuario no pertenece a la organización');
      }

      //TODO: Crear usuario en la base de datos si no existe

      const user = {
        id: idToken.sub,
        correo: idToken.emails?.[0] || idToken.preferred_username,
        nombre: idToken.name,
        tenantId: idToken.tid,
      };

      // ✅ Genera TU JWT (no el de Azure)
      const payload = { userId: user.id, correo: user.correo };
      const jwt = await this.jwtService.signAsync(payload, {
        secret: appConfig.secretJwt,
        expiresIn: '7d',
      });

      // ✅ Establece cookie HTTP-only (segura)
      res.cookie('auth_session', jwt, {
        httpOnly: true,
        secure: appConfig.isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      res.redirect(`${appConfig.urlFrontend}/presupuestos`);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect(`${appConfig.urlFrontend}/login?error=auth_failed`);
    }
  }

  @Public()
  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('auth_session');
    res.redirect(`${appConfig.urlFrontend}/login`);
  }
}
