import { messageFactory, messages } from '@app/shared/messages.shared';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class GenericMasterDataDto {
	@IsEnum([
		'NPRD',
		'EDUN',
		'GSYS',
		'MAST',
		'CTGY',
		'CRCY',
		'PWDT',
		'REOB',
		'WPUS',
		'EDUM',
		'BAUG',
		'MAPG',
		'DPHD',
		'TMPE',
		'SBCB',
		'SBSB',
		'WPOC',
		'All'
	])
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Group']) })
	@IsString()
	@IsNotEmpty()
	group: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Active']) })
	@IsNumber({}, { message: messageFactory(messages.W1, ['value for active']) })
	@IsEnum([1, 0, -1], { each: true, message: messageFactory(messages.W1, ['value for active']) })
	active: number;
}

export class NestedDto {
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Parent id']) })
	parent_id: Types.ObjectId;
	@IsOptional()
	search: string;
	@IsEnum([1, -1, 0], { message: messageFactory(messages.W1, ['value for the property active']) })
	@IsNumber({}, { message: messageFactory(messages.W1, ['value for the property active']) })
	active: number;
	@IsOptional()
	pageNo: number;
}

export class MasterDataDto {
	@IsOptional()
	search: string;
	@IsEnum([1, -1, 0], { message: messageFactory(messages.W1, ['value for the property active']) })
	@IsNumber({}, { message: messageFactory(messages.W1, ['value for the property active']) })
	active: number;
	@IsOptional()
	pageNo: number;
}
