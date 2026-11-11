import { Module } from '@nestjs/common';
import { AccountMailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppConfigService } from '@app/config/appconfig.service';

@Module({
	imports: [
		MailerModule.forRootAsync({
			useFactory: async (configService: AppConfigService) => ({
				...configService.get('mailConfig')
			}),
			inject: [AppConfigService]
		})
	],
	providers: [AccountMailService],
	exports: [AccountMailService]
})
export class MailModule {}
