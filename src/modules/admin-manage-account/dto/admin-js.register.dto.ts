import { messageFactory, messages } from '@app/shared/messages.shared';
import { CommonRegExp } from '@app/shared/regex.shared';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, plainToClass } from 'class-transformer';
import { IsNotEmpty, IsOptional, Matches, ValidateNested } from 'class-validator';

class JobseekerProfileDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Full name']) })
	fullName: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Email address']) })
	@Matches(CommonRegExp.EMAIL_REGEXP, { message: messageFactory(messages.W1, ['email address']) })
	email: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Phone number']) })
	phno: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Fresher']) })
	fresher: boolean;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Access']) })
	access: boolean;
	@ApiProperty()
	@IsOptional()
	currentcity: string;
	@ApiProperty()
	@IsOptional()
	currentcountry: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Country code']) })
	country_code: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Date of birth (DOB)']) })
	dateofbirth: string;
}

class AdminJobSeekerRegDto {
	@IsOptional()
	readonly resume: any;
	@IsOptional()
	readonly video: any;
	@ApiProperty()
	@Type(() => JobseekerProfileDto)
	@ValidateNested({ each: true })
	@IsNotEmpty({ message: messageFactory(messages.W2, ['State']) })
	@Transform(({ value }) => {
		if (typeof value === 'string') value = JSON.parse(value);
		return plainToClass(JobseekerProfileDto, value);
	})
	readonly jsProfile: JobseekerProfileDto;
}

class JsDetailsDto {
	@IsOptional()
	active: boolean;
	@IsOptional()
	role: string;
}
export { AdminJobSeekerRegDto, JsDetailsDto };
