import { AdminMacModule } from '@app/modules/admin-manage-account/admin-mac.module';
import { CoreModule } from '@app/core/core.module';
import { ManageAccountModule } from '@app/modules/manage-account/manage-account.module';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
	imports: [CoreModule, ManageAccountModule, AdminMacModule],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
