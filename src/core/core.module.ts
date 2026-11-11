import { exportProvider, getProviders, importProviders } from '@app/core/providers';
import { Global, Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';

@Global()
@Module({
	imports: [...importProviders(), MailModule],
	providers: [...getProviders()],
	exports: [...exportProvider()]
})
export class CoreModule {}
