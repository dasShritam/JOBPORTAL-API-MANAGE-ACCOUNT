import { AbstractAdminMacSvc } from '@app/modules/admin-manage-account/admin-mac.abstract';
import { AdminMacController } from '@app/modules/admin-manage-account/admin-mac.controller';
import { AdminMacService } from '@app/modules/admin-manage-account/admin-mac.service';
import { Module } from '@nestjs/common';

@Module({
	imports: [],
	controllers: [AdminMacController],
	providers: [
		{
			provide: AbstractAdminMacSvc,
			useClass: AdminMacService
		}
	]
})
export class AdminMacModule {}
