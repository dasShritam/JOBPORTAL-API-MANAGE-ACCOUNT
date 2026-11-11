import { DatabaseService } from '@app/database/database.service';
import { AbstractManageAccountDao } from '@app/database/mongo/abstract/manage-account.abstract';
import { mongoDbProvider } from '@app/database/mongo/connection/connection.mongo';
import { mongoDbModelsProvider } from '@app/database/mongo/connection/models.connection.mongo';
import { ManageAccountDao } from '@app/database/mongo/dao/manage-account.dao';
import { Module } from '@nestjs/common';

@Module({
	providers: [
		...mongoDbProvider,
		...mongoDbModelsProvider,
		DatabaseService,
		{
			provide: AbstractManageAccountDao,
			useClass: ManageAccountDao
		}
	],
	exports: [
		DatabaseService,
		{
			provide: AbstractManageAccountDao,
			useClass: ManageAccountDao
		}
	]
})
export class DatabaseModule {}
