import { messageFactory, messages } from '@app/shared/messages.shared';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

class EmployerKycDto {
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Status']) })
	status: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Permanent account number (PAN)']) })
	panNo: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Name as per permanent account number (PAN)']) })
	panName: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Date of birth as per permanent account number (PAN)']) })
	panDate: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Goods and services tax identification number (GSTIN)']) })
	gstin: string;
}
class EmployerDto {
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Employer Id']) })
	@IsMongoId({ message: messageFactory(messages.W1, ['Employee Id']) })
	id: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Know your customer (KYC) information']) })
	@ValidateNested({ each: true })
	@Type(() => EmployerKycDto)
	kyc_info: EmployerKycDto;
}
class PhoneNumber {
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Primary phone number']) })
	readonly primary: string;
	@IsOptional()
	readonly secondary: string;
}

class PointOfContactDto {
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Phone number']) })
	@ValidateNested({ each: true })
	@Type(() => PhoneNumber)
	readonly ph: PhoneNumber;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Point of contact (POC) person name']) })
	readonly name: string;
	@IsOptional()
	readonly designation: string;
}

class AddressDto {
	@IsNotEmpty({ message: messageFactory(messages.W2, ['street']) })
	readonly street: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Pincode']) })
	readonly zip: string;
}

class CompanyInfoDto {
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Industry type']) })
	readonly industry_type: string;
	@IsOptional()
	readonly alias: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Point of contact (POC) information']) })
	@ValidateNested({ each: true })
	@Type(() => PointOfContactDto)
	readonly poc: PointOfContactDto;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Address information']) })
	@ValidateNested({ each: true })
	@Type(() => AddressDto)
	readonly adr: AddressDto;
	@IsOptional()
	readonly website: string;
	@IsOptional()
	readonly hv_profile: string;
	@IsOptional()
	readonly cl_profile: string;
	@IsOptional()
	readonly fax: string;
	@IsOptional()
	readonly tan: string;
}

class CompanyDetailsDto {
	@IsNotEmpty({ message: messageFactory(messages.W2, ['company_info']) })
	@ValidateNested({ each: true })
	@Type(() => CompanyInfoDto)
	readonly company_info: CompanyInfoDto;
}
class EmpAccountDetailsDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['role']) })
	role: string;

	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Phone number']) })
	phno: string;
}

export { EmpAccountDetailsDto, EmployerDto, CompanyDetailsDto };
