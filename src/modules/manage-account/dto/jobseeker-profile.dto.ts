import { messageFactory, messages } from '@app/shared/messages.shared';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';

class ProjectDesignationDto {
	@IsOptional()
	name: string;
	@IsOptional()
	desc: string;
}

class JobSeekerProjectDto {
	@IsOptional()
	_id: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Project title']) })
	title: string;

	@IsNotEmpty({ message: messageFactory(messages.W2, ['Project description']) })
	desc: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Client name']) })
	client: string;

	@IsOptional()
	location: string;
	@IsArray({ message: messageFactory(messages.W1, ['skills']) })
	@IsOptional()
	skills: string[];
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => ProjectDesignationDto)
	designation: ProjectDesignationDto;

	@IsOptional()
	employment_type: string;
	@IsNumber({}, { message: messageFactory(messages.W1, ['team size']) })
	@IsOptional()
	team_size: number;

	@IsOptional()
	edu_tag: string;
	@IsBoolean({ message: messageFactory(messages.W1, ['value for on site']) })
	@IsOptional()
	on_site: boolean;

	@IsNotEmpty({ message: messageFactory(messages.W2, ['Start date']) })
	start_ts: string;

	@IsOptional()
	end_ts: string;
}

class JobSeekerPresentationDto {
	@IsOptional()
	_id: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Presentationt title']) })
	title: string;

	@IsOptional()
	desc: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['URL']) })
	uri: string;
	@IsNumber({}, { message: messageFactory(messages.W1, ['year']) })
	@IsOptional()
	year: number;

	@IsOptional()
	month: string;
}

class PublicationDto {
	@IsOptional()
	_id: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Publication title']) })
	title: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Publication URL']) })
	uri: string;

	@IsOptional()
	year: string;

	@IsOptional()
	month: string;

	@IsOptional()
	desc: string;
}

class PatentDto {
	@IsOptional()
	@IsMongoId({ message: messageFactory(messages.W1, ['patent id']) })
	patentid: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Patent title']) })
	title: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Patent URL']) })
	uri: string;
	@IsOptional()
	app_no: string;
	@IsOptional()
	desc: string;
	@IsOptional()
	status: string;
	@IsOptional()
	ofc: string;
	@IsOptional()
	@IsNumber({}, { message: messageFactory(messages.W1, ['year']) })
	issued_year: string;
	@IsOptional()
	@IsNumber({}, { message: messageFactory(messages.W1, ['month']) })
	issued_month: string;
}

class WorkSampleDto {
	@IsOptional()
	_id: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Work title']) })
	title: string;

	@IsOptional()
	desc: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['URL']) })
	uri: string;
	@IsOptional()
	DurationFrom: string;
	@IsOptional()
	DurationTo: string;
	@IsOptional()
	DurationFrommonth: string;
	@IsOptional()
	DurationTomonth: string;
}

class JobSeekerCareerDto {
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Current industry']) })
	currentIndustry: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Department']) })
	department: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Role category']) })
	roleCategory: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Job role']) })
	jobRole: string;
	@IsOptional()
	@IsArray({ message: messageFactory(messages.W1, ['job type(s)']) })
	jobTypecheckbox: [string];
	@IsOptional()
	@IsArray({ message: messageFactory(messages.W1, ['employment type(s)']) })
	empTypecheckbox: [string];

	@IsOptional()
	preferedShift: string;
	@IsOptional()
	exp_ctc: any;
	@IsOptional()
	@IsArray({ message: messageFactory(messages.W1, ['prefered location(s)']) })
	preferedLocation: [string];
}

class JobseekerOnlineProfileDto {
	@IsOptional()
	_id: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Online profile name']) })
	name: string;
	@IsOptional()
	desc: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['URL']) })
	uri: string;
}

class JsDetailsDto {
	@IsOptional()
	active: boolean;
	@IsOptional()
	role: string;
}

class JobSeekerBasicDetailsDto {
	@IsOptional()
	expId: string;
	@IsOptional()
	name: string;
	@IsOptional()
	code: string;
	@IsBoolean({ message: messageFactory(messages.W1, ['value for fresher']) })
	@IsOptional()
	fresher: boolean;
	@IsOptional()
	experience: any;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Current location']) })
	curr_location: any;
	@IsOptional()
	contacts: any;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Phone number']) })
	phno: string;
	@IsOptional()
	notice_period: any;
	@IsOptional()
	join_after: string;
}

class JobSeekerCertDto {
	@ApiProperty()
	@IsOptional()
	_id: string;
	@ApiProperty()
	@IsOptional()
	name: string;
	@ApiProperty()
	@IsOptional()
	certificate_id: string;
	@ApiProperty()
	@IsOptional()
	uri: string;
	@ApiProperty()
	@IsOptional()
	fromMonth: string;
	@ApiProperty()
	@IsOptional()
	fromYear: string;
	@ApiProperty()
	@IsOptional()
	toMonth: string;
	@ApiProperty()
	@IsOptional()
	toYear: string;
	@ApiProperty()
	@IsOptional()
	issued_by: string;
}

export class JobSeekerEduDto {
	@IsOptional()
	educationid: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Education type']) })
	type: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Education']) })
	education: string;
	@IsOptional()
	universityInstitute: string;
	@IsOptional()
	course: string;
	@IsOptional()
	specialization: string;
	@IsOptional()
	courseType: string;
	@IsOptional()
	@IsNumber({}, { message: messageFactory(messages.W1, ['course duration start date']) })
	courseDurationStart: number;
	@IsOptional()
	@IsNumber({}, { message: messageFactory(messages.W1, ['course duration end date']) })
	courseDurationEnd: number;
	@IsOptional()
	gradingSystem: string;
	@IsOptional()
	@IsNumber({}, { message: messageFactory(messages.W1, ['marks']) })
	marks: number;
	@IsOptional()
	board: string;
	@IsOptional()
	@IsNumber({}, { message: messageFactory(messages.W1, ['pass out year']) })
	passingOutYear: number;
	@IsOptional()
	schoolMedium: string;
	@IsOptional()
	totalMarks: string;
	@IsOptional()
	@IsNumber({}, { message: messageFactory(messages.W1, ['english marks']) })
	englishMarks: number;
	@IsOptional()
	@IsNumber({}, { message: messageFactory(messages.W1, ['maths marks']) })
	mathsMarks: number;
}

class ExperienceDto {
	@IsOptional()
	month: number;
	@IsOptional()
	year: number;
}

class JobSeekerItSkillsDto {
	@IsOptional()
	_id: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Skill name']) })
	name: string;
	@IsOptional()
	ver: string;
	@IsOptional()
	last_used: string;
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => ExperienceDto)
	exp: ExperienceDto;
}

class NoticePeriodDto {
	@IsOptional()
	term: string;
	@IsOptional()
	offered_role: string;
	@IsOptional()
	company: string;
	@IsOptional()
	offer_salary: {
		currency: string;
		ctc: string;
	};
	@IsOptional()
	end_year: number;
	@IsOptional()
	end_month: number;
	@IsOptional()
	end_day: number;
}

class ProjectDto {
	@IsOptional()
	desc: string;
	@IsOptional()
	uri: string;
}

class FullTimeDto {
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Role']) })
	role: string;
	@IsOptional()
	job_desc: string;
	@IsOptional()
	skills: Array<string>;

	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => NoticePeriodDto)
	noticePeriod: NoticePeriodDto;
}

class InternshipDto {
	@IsOptional()
	location: string;
	@IsOptional()
	dept: string;
	@IsOptional()
	category: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Role']) })
	role: string;
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => ProjectDto)
	proj: ProjectDto;
}

class JobSeekerEmploymentDto {
	@IsOptional()
	employement_id: string;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Employment start year']) })
	start_year: number;
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Employment start month']) })
	start_month: number;
	@IsOptional()
	end_year: number;
	@IsOptional()
	end_month: number;
	@IsOptional()
	experience: {
		currency: string;
		curr_ctc: number;
	};
	@IsOptional()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['organization']) })
	org: string;
	@IsOptional()
	@IsNumber({}, { message: messageFactory(messages.W1, ['experience in year(s)']) })
	expYear: number;
	@IsOptional()
	@IsNumber({}, { message: messageFactory(messages.W1, ['experience in month(s)']) })
	expMonth: number;
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => FullTimeDto)
	fullTime: FullTimeDto;
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => InternshipDto)
	internship: InternshipDto;
}

//#region Jobseeker personal details
class AddressesDto {
	@ApiProperty()
	@IsOptional()
	street: string;
	@ApiProperty()
	@IsOptional()
	city: string;
	@ApiProperty()
	@IsOptional()
	@IsNumber({}, { message: messageFactory(messages.W1, ['postal identification number (PIN)']) })
	zip: number;
}

class LanguagesDto {
	@ApiProperty()
	@IsOptional()
	name: string;
	@ApiProperty()
	@IsOptional()
	ability: string[];
	@ApiProperty()
	@IsOptional()
	level: string;
}

class DurationDto {
	@ApiProperty()
	@IsOptional()
	from_ts: number;
	@ApiProperty()
	@IsOptional()
	till_ts: number;
}

class CareerBreakDto {
	@ApiProperty()
	@IsOptional()
	@IsBoolean({ message: messageFactory(messages.W1, ['value for from break']) })
	from_break: boolean;
	@ApiProperty()
	@IsOptional()
	reason: string;
	@ApiProperty()
	@IsOptional()
	@ValidateNested({ each: true, message: messageFactory(messages.W1, ['duration']) })
	@Type(() => DurationDto)
	duration: DurationDto;
}

class JobSeekerPersonalDetailsDto {
	@ApiProperty()
	@IsOptional()
	_id: string;
	@ApiProperty()
	@IsOptional()
	user_id: string;

	@ApiProperty()
	@IsOptional()
	gender: string;
	@ApiProperty()
	@IsOptional()
	dob_ts: string;
	@ApiProperty()
	@IsOptional()
	marital_status: string;
	@ApiProperty()
	@IsOptional()
	category: string;
	@ApiProperty()
	@IsOptional()
	@IsBoolean({ message: messageFactory(messages.W1, ['value for disability']) })
	disability: boolean;
	@ApiProperty()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => CareerBreakDto)
	career_break: CareerBreakDto;
	@ApiProperty()
	@IsOptional()
	@ValidateNested({ each: true, message: messageFactory(messages.W1, ['language(s)']) })
	@Type(() => LanguagesDto)
	languages: LanguagesDto;
	@ApiProperty()
	@IsOptional()
	@ValidateNested({ each: true, message: messageFactory(messages.W1, ['address']) })
	@Type(() => AddressesDto)
	addresses: AddressesDto;
	@ApiProperty()
	@IsOptional()
	work_permit: string;
	@ApiProperty()
	@IsOptional()
	@IsArray()
	work_permitOC: string[];
	@ApiProperty()
	@IsOptional()
	more_info: string;
	@ApiProperty()
	@IsOptional()
	assistance: string;
	@ApiProperty()
	@IsOptional()
	disability_type: string;
}
//#endregion

export {
	JobSeekerPersonalDetailsDto,
	JsDetailsDto,
	JobSeekerCareerDto,
	JobseekerOnlineProfileDto,
	JobSeekerPresentationDto,
	JobSeekerProjectDto,
	PatentDto,
	PublicationDto,
	WorkSampleDto,
	JobSeekerEmploymentDto,
	JobSeekerCertDto,
	JobSeekerBasicDetailsDto,
	JobSeekerItSkillsDto
};
