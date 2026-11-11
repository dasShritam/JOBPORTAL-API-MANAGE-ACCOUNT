import { Module } from '@nestjs/common';
import { AbstractManageAccountSvc } from './manage-acccount.abstract';
import { ManageAccountController } from './manage-account.controller';
import { ManageAccountService } from './manage-account.service';

@Module({
	imports: [],
	controllers: [ManageAccountController],
	providers: [
		{
			provide: AbstractManageAccountSvc,
			useClass: ManageAccountService
		}
	]
})
export class ManageAccountModule {}
