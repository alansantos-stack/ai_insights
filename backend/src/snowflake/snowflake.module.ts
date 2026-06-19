import { Module } from '@nestjs/common';
import { SnowflakeService } from './snowflake.service';
import { AzureAuthModule } from '../azure-auth/azure-auth.module';

@Module({
  imports: [AzureAuthModule],
  providers: [SnowflakeService],
  exports: [SnowflakeService],
})
export class SnowflakeModule {}
