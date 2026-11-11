import { AppConfigService } from '@app/config/appconfig.service';
import AppLogger from '@app/core/logger/app-logger';
import { DatabaseModule } from '@app/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/authorization.guard';
import { TempAuthGuard } from './guards/tempAuthorization.guard';
import { MailModule } from './mail/mail.module';

const getProviders = (): any[] => {
		return [AppLogger, AppConfigService, { provide: APP_GUARD, useClass: AuthGuard }, { provide: APP_GUARD, useClass: TempAuthGuard }];
	},
	importProviders = (): any[] => {
		return [ConfigModule.forRoot(), DatabaseModule, MailModule];
	},
	exportProvider = (): any[] => {
		return [AppLogger, AppConfigService, DatabaseModule, MailModule];
	};

export { importProviders, exportProvider, getProviders };
