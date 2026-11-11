import { messageFactory, messages } from '@app/shared/messages.shared';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

class ParamsDto {
	@IsOptional()
	key: string;
	@IsOptional()
	value: boolean | number | string;
}

class CommonMasterDto {
	@IsEnum(['FUYE', 'YOEP', 'MOEP', 'PAYE', 'GTMO', 'ALL'])
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Group']) })
	group: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Params']) })
	@ValidateNested({ each: false })
	@Type(() => ParamsDto)
	params: [ParamsDto];
}

export { CommonMasterDto };
