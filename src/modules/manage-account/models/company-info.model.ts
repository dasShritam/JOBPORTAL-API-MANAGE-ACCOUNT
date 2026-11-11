import { ObjectId } from 'mongoose';

export class UserId {
	readonly user_id: ObjectId;
}

export class PhoneNumber {
	readonly primary: string;
	readonly secondary: string;
}
export class AddressDto {
	readonly street: string;
	readonly zip: string;
}

export class PointOfContactDto {
	readonly ph: PhoneNumber;
	readonly name: string;
	readonly designation: string;
}

export class CompanyInfoDto {
	readonly user_id: string;
	readonly name: string;
	readonly industry_type: string;
	readonly alias: string;
	readonly poc: PointOfContactDto;
	readonly adr: AddressDto;
	readonly website: string;
	readonly hv_profile: string;
	readonly cl_profile: string;
	readonly fax: string;
	readonly tan: string;
}

export class CompanyDetailsDto {
	data: any;
	readonly userid: UserId;
	readonly company_info: CompanyInfoDto;
}
