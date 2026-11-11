export interface JobSeekerEdu {
	type: string;
	userid: undefined | string;
	educationid: undefined | string;
	education: string;
	universityInstitute: string | undefined;
	course: string | undefined;
	otherCourse: string | undefined;
	specialization: string | undefined;
	otherSpecialization: string | undefined;
	courseType: string | undefined;
	courseDurationStart: number | undefined;
	courseDurationEnd: number | undefined;
	gradingSystem: string | undefined;
	marks: number | undefined;
	board: string | undefined;
	passingOutYear: number | undefined;
	schoolMedium: string | undefined;
	totalMarks: string | undefined;
	englishMarks: number | undefined;
	mathsMarks: number | undefined;
}
