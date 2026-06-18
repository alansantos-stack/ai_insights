
# Azure AD External OAuth — Snowflake Authentication

## Overview

Replaces the previous username/password Snowflake authentication with Azure Active Directory (Entra ID) External OAuth. The NestJS backend authenticates to Snowflake using a service principal identity instead of static credentials.

**Library:** `@azure/identity` (`ClientSecretCredential`) — chosen over MSAL Node for its smaller API surface, built-in token caching, and zero-code upgrade path to `ManagedIdentityCredential` when running on Azure compute.

## Architecture

```
NestJS startup
    │
    ▼
AzureAuthService (singleton)
    │  new ClientSecretCredential(tenantId, clientId, secret)
    │
    ▼
SnowflakeService.runCortexQuery()
    │
    ├─► AzureAuthService.getSnowflakeToken()
    │       │
    │       ├─ cache HIT (handled internally by @azure/identity) ──► return token
    │       └─ cache MISS ──► Azure AD /oauth2/v2.0/token ──► return JWT
    │
    ▼
snowflake.createConnection({
    account, database, warehouse, schema,
    authenticator: 'oauth',
    token: <azure_ad_jwt>
})
    │
    ▼
connection.connect() → execute Cortex SQL
```

## Module Structure

```
backend/src/
  azure-auth/
    azure-auth.module.ts    — declares + exports AzureAuthService
    azure-auth.service.ts   — fetches and caches token via @azure/identity
  snowflake/
    snowflake.module.ts     — imports AzureAuthModule
    snowflake.service.ts    — injects AzureAuthService, uses authenticator: 'oauth'
```

`AzureAuthService` is a NestJS singleton. `@azure/identity` handles token expiry and refresh internally — no manual cache or timer needed.

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `AZURE_TENANT_ID` | Azure AD / Entra ID tenant GUID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `AZURE_CLIENT_ID` | Service principal app registration client ID | `yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy` |
| `AZURE_CLIENT_SECRET` | Client secret value — never commit; inject via CI/CD | `~AbcDefGhi123...` |
| `AZURE_SNOWFLAKE_SCOPE` | OAuth scope for Snowflake External OAuth | `api://ai-insights-snowflake/.default` |

Variables no longer used in the live auth path: `SNOWFLAKE_USER`, `SNOWFLAKE_PASSWORD`.

## Azure AD Setup (Manual Steps)

1. **Create app registration** — Azure Portal → Entra ID → App registrations → New registration.
   - Name: `ai-insights-snowflake` (or similar)
   - Supported account types: single-tenant
   - No redirect URI needed (daemon/service app)
   - Note the **Application (client) ID** and **Directory (tenant) ID**

2. **Create a client secret** — Certificates & secrets → New client secret → copy the value immediately.

3. **Remove default permissions** — API permissions → remove the default `User.Read` delegated Graph permission.

4. **Expose an API scope** — Expose an API → set an Application ID URI (e.g. `api://ai-insights-snowflake`) → add a scope. This URI becomes the base of `AZURE_SNOWFLAKE_SCOPE`.

5. **Set token version** — In the app manifest, set `accessTokenAcceptedVersion: 2` to issue v2.0 tokens (required by Snowflake External OAuth).

## Snowflake Setup (Manual SQL)

Run as `ACCOUNTADMIN` or `SECURITYADMIN`:

```sql
-- Create the External OAuth security integration
CREATE SECURITY INTEGRATION azure_ad_oauth
  TYPE = EXTERNAL_OAUTH
  ENABLED = TRUE
  EXTERNAL_OAUTH_TYPE = AZURE
  EXTERNAL_OAUTH_ISSUER = 'https://sts.windows.net/<AZURE_TENANT_ID>/'
  EXTERNAL_OAUTH_JWS_KEYS_URL = 'https://login.microsoftonline.com/<AZURE_TENANT_ID>/discovery/v2.0/keys'
  EXTERNAL_OAUTH_AUDIENCE_LIST = ('<AZURE_APPLICATION_ID_URI>')
  EXTERNAL_OAUTH_TOKEN_USER_MAPPING_CLAIM = 'sub'
  EXTERNAL_OAUTH_SNOWFLAKE_USER_MAPPING_ATTRIBUTE = 'login_name'
  EXTERNAL_OAUTH_ALLOWED_ROLES = ('<minimum-required-role>');

-- Create a Snowflake user mapped to the service principal
CREATE USER azure_svc_ai_insights
  LOGIN_NAME = '<SERVICE_PRINCIPAL_OBJECT_ID>'
  DEFAULT_ROLE = <your-role>
  DEFAULT_WAREHOUSE = <your-warehouse>
  TYPE = SERVICE;

GRANT ROLE <your-role> TO USER azure_svc_ai_insights;
```

**Notes:**
- `EXTERNAL_OAUTH_AUDIENCE_LIST` must exactly match the `aud` claim in the Azure AD token — decode a sample token at jwt.io to verify before connecting.
- `LOGIN_NAME` must equal the service principal's Object ID (the `sub` claim value in the token).
- Set `EXTERNAL_OAUTH_ALLOWED_ROLES` to the minimum role that can execute `SNOWFLAKE.CORTEX.COMPLETE` — do not use `ACCOUNTADMIN`.

## Local Development (Mock Mode)

`SNOWFLAKE_MOCK=true` bypasses all Azure AD and Snowflake connections and returns hardcoded data. Use this until the Azure and Snowflake integration steps above are complete.

**Production guard:** The app throws at startup if `SNOWFLAKE_MOCK=true` and `NODE_ENV=production` are both set simultaneously.

```
# .env (dev only)
SNOWFLAKE_MOCK=true
NODE_ENV=development
```

## Upgrading to Managed Identity

When running on Azure hosting (App Service, Container Apps, AKS), swap the credential with zero other code changes:

```typescript
// Before — service principal (local dev / non-Azure hosting)
import { ClientSecretCredential } from '@azure/identity';
this.credential = new ClientSecretCredential(tenantId, clientId, secret);

// After — Managed Identity (Azure hosting, no secrets needed)
import { ManagedIdentityCredential } from '@azure/identity';
this.credential = new ManagedIdentityCredential();
```

Remove `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, and `AZURE_TENANT_ID` from the environment when using Managed Identity — no secret to store or rotate.

## Security Notes

- **Never commit `AZURE_CLIENT_SECRET`** — inject it via CI/CD environment variable, Azure Key Vault reference, or managed secrets store.
- Error logs contain only `err.message` and `err.code`, never the full error object (which can include token metadata).
- `POST /insights/trigger` has no authentication guard — add an API key check before exposing this endpoint beyond localhost.
- Set a calendar reminder before the client secret expiry date; Snowflake will reject expired tokens immediately.
- Rotate the client secret in Azure first, update the env var, then redeploy — the old secret remains valid until its `exp` window closes.
