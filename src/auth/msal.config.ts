import { Injectable } from '@nestjs/common';
import { ConfidentialClientApplication } from '@azure/msal-node';

@Injectable()
export class MsalConfigService {
  private readonly msalInstance: ConfidentialClientApplication;

  constructor() {
    this.msalInstance = new ConfidentialClientApplication({
      auth: {
        clientId: process.env.AZURE_CLIENT_ID!,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
      },
    });
  }

  getInstance(): ConfidentialClientApplication {
    return this.msalInstance;
  }
}
