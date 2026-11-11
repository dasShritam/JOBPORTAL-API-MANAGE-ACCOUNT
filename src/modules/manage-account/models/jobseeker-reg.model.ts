import { messageFactory, messages } from '@app/shared/messages.shared';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class JobSeekerRegistrationDto {
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Title']) })
	@IsString()
	fullname: string;

	@IsEmail()
	email: string;

	@IsString()
	password: string;

	@IsPhoneNumber()
	phonenumber: string;

	@IsOptional()
	@IsBoolean()
	experiance: boolean;

	@IsOptional()
	@IsBoolean()
	fresher: boolean;

	@IsOptional()
	@IsString()
	currentcity: string;

	@IsOptional()
	@IsString()
	currentcountry: string;
}
