import { messageFactory, messages } from '@app/shared/messages.shared';
import { CommonRegExp } from '@app/shared/regex.shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, Matches } from 'class-validator';

class AdminEmployerRegisterDto {
	@ApiProperty()
	@Matches(CommonRegExp.NAME_REGEXP, { message: messageFactory(messages.W1, ['full name']) })
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Full name']) })
	readonly empName: string;
	@ApiProperty()
	@Matches(CommonRegExp.EMAIL_REGEXP, { message: messageFactory(messages.W1, ['email address']) })
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Email address']) })
	readonly empMail: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Country code']) })
	readonly empPhoneCode: string;
	@ApiProperty()
	@Matches(CommonRegExp.PHONE_REGEXP, { message: messageFactory(messages.W1, ['phone number']) })
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Phone number']) })
	readonly empPhoneNo: string;
	@ApiProperty()
	@Matches(CommonRegExp.COMPANY_NAME_REGEXP, { message: messageFactory(messages.W1, ['company name']) })
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Company name']) })
	readonly empCompany: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Company domain type']) })
	readonly empType: string;
	@ApiProperty()
	@Matches(CommonRegExp.DESIGNATION_REGEXP, { message: messageFactory(messages.W1, ['designation']) })
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Designation']) })
	readonly empDesignation: string;
	@ApiProperty()
	@Matches(CommonRegExp.POSTAL_INDEX_REGEXP, { message: messageFactory(messages.W1, ['postal index number (PIN)']) })
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Postal index number (PIN)']) })
	readonly empPin: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Company address']) })
	readonly empAddress: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Employer access']) })
	@IsBoolean({ message: messageFactory(messages.W2, ['Employer access']) })
	readonly empAccess: boolean;
}

export { AdminEmployerRegisterDto };
