export class ProjectDesignation {
	name: string;
	desc: string;
}

export interface JobSeekerProject {
	_id: string;
	title: string;
	desc: string;
	client: string;
	location: string;
	skills: Array<string>;
	designation: ProjectDesignation;
	employment_type: string;
	team_size: string;
	edu_tag: string;
	on_site: string;
	start_ts: Date;
	end_ts: Date;
}

export interface JobSeekerPresentation {
	_id: string;
	title: string;
	desc: string;
	uri: string;
}

//personal details model

export interface Addresses {
	street: string;
	city: string;
	zip: number;
}

export interface Languages {
	_id: string;
	name: string;
	ability: string;
	level: string;
}

export interface CareerBreak {
	from_break: boolean;
	reason: string;
	duration: Duration;
}

export interface Duration {
	from_ts: {
		startYear: number;
		startMonth: string;
	};
	till_ts: {
		endYear: number;
		endMonth: string;
	};
}

export interface JobSeekerPersonalDetails {
	_id: string;
	user_id: string;
	gender: string;
	dob_ts: {
		year: number;
		month: string;
		day: number;
	};
	marital_status: string;
	category: string;
	disability: boolean;
	career_break: CareerBreak;
	languages: Languages[];
	addresses: Addresses[];
	work_permit: string;
	work_permitOC: string[];
	more_info: string;
	assistance: string;
	disability_type: string;
}

export interface PersonalDetailss {
	user_id: string;
	personaldetails: JobSeekerPersonalDetails;
}

//end personal detail model

//start certification model
export interface JobSeekerCertificate {
	certificationId: string;
	user_id: string;
	name: string;
	issued_by: string;
	completion_year: number;
	uri: string;
	FromMonth: string;
	FromYear: string;
	ToMonth: string;
	ToYear: string;
}
//end certification model

export interface JobseekerOnlineProfile {
	_id: string;
	name: string;
	desc: string;
	uri: string;
}

export interface OnlineProfile {
	user_id: string;
	profileDetails: JobseekerOnlineProfile;
}

export interface JobSeekerPresentation {
	_id: string;
	title: string;
	desc: string;
	uri: string;
}

export interface Presentation {
	user_id: string;
	pptDetails: JobSeekerPresentation;
}

export interface ProjectDetails {
	user_id: string;
	projectDetails: JobSeekerProject;
}
