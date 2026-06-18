import { Injectable, Logger } from '@nestjs/common';
import { ClientSecretCredential } from '@azure/identity';

@Injectable()
export class AzureAuthService {
  private readonly logger = new Logger(AzureAuthService.name);
  private credential: ClientSecretCredential;

  constructor() {
    this.credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID as string,
      process.env.AZURE_CLIENT_ID as string,
      process.env.AZURE_CLIENT_SECRET as string,
    );
  }

  async getSnowflakeToken(): Promise<string> {
    if (process.env.INTEGRATION_MSAL_ACCESS_TOKEN) {
      this.logger.warn('Using INTEGRATION_MSAL_ACCESS_TOKEN — for testing only, do not use in production');
      return process.env.INTEGRATION_MSAL_ACCESS_TOKEN;
    }
    const scope = process.env.AZURE_SNOWFLAKE_SCOPE as string;
    const tokenResponse = await this.credential.getToken(scope);
    return tokenResponse.token;
  }
}
