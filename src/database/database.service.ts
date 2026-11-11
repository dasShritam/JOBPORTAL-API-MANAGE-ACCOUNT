import { AbstractManageAccountDao } from '@app/database/mongo/abstract/manage-account.abstract';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
	constructor(public manageAcTxn: AbstractManageAccountDao) {}
}
