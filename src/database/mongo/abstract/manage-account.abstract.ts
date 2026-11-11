import { EmployerRegisterDto } from '@app/modules/admin-manage-account/models/adminEmpRegister';
import { AtPayload } from '@app/modules/manage-account/models/jwt-payload.model';
import { AppResponse } from '@app/shared/appresponse.shared';

export abstract class AbstractManageAccountDao {
	abstract getJobSeekerDetails(id: string): Promise<AppResponse>;
	abstract updateCompanyDetails(user_id, company_info): Promise<AppResponse>;
	abstract UpdateEmpAccountInfo(accountdetails): Promise<AppResponse>;
	abstract getEmployerProfile(id: any): Promise<AppResponse>;
	abstract updateJSProject(projectDetails: any): Promise<AppResponse>;
	abstract updateJSOnlinePpt(pptDetails: any): Promise<AppResponse>;
	abstract updateKeySkills(session_id: string, keySkills: string[]): Promise<AppResponse>;
	abstract updateJobSeekerEduDetails(educationData: any): Promise<AppResponse>;
	abstract updateJobSeekerItSkills(iTSkills: any): Promise<AppResponse>;

	abstract updatePublication(user_id: any, info: any): Promise<AppResponse>;
	abstract updatePatent(patentinfo: any): Promise<AppResponse>;
	abstract updateJSOnlineProfile(profileDetails: any): Promise<AppResponse>;

	abstract patchCertificate(certificateDetails: any): Promise<AppResponse>;
	abstract updateJobSeekerPersonalDetails(personalDetails: any): Promise<AppResponse>;
	abstract jobSeekerSelfRegister(jsDetails: any, ip: string, tempToken: string, days: string): Promise<AppResponse>;

	abstract updateResumeHeaderAction(header: string): Promise<AppResponse>;
	abstract updateProfileSummaryAction(summary: string): Promise<AppResponse>;
	abstract updateWorkSample(user_id: string, info: any): Promise<AppResponse>;
	abstract deletePublication(PublicationId: any): Promise<AppResponse>;
	// abstract updateJobseekerCareer(data: any): Promise<AppResponse>;
	abstract updateJobseekerEmployement(employement: any): Promise<AppResponse>;

	abstract updateJobseekerCareer(data: any): Promise<AppResponse>;
	abstract updateJobSeekerBasicDetails(data: any): Promise<AppResponse>;
	abstract fetchJobseekerInfo(options: any): Promise<AppResponse>;
	abstract fetchEmployerInfo(options: any): Promise<AppResponse>;
	abstract fetchUserInfo(options: any): Promise<AppResponse>;
	abstract fetchEmpJsDetails(claims: any): Promise<AppResponse>;
	abstract fetchEmpJsReport(claims): Promise<AppResponse>;
	abstract postEmpRegister(empRegDetails: EmployerRegisterDto, ip: string, tempToken: string, admin_id: string, days: string): Promise<AppResponse>;
	abstract getMail(mail: string): Promise<AppResponse>;
	abstract deleteEmployement(delEmployement: any): Promise<AppResponse>;
	abstract deleteProject(data: any): Promise<AppResponse>;
	abstract deletePresentation(presentationObj: any): Promise<AppResponse>;
	abstract deletePatent(patent: any): Promise<AppResponse>;
	abstract deleteJobSeekerItSkillDetails(iTSkillsId: any): Promise<AppResponse>;
	abstract deleteWorksample(info: any): Promise<AppResponse>;
	abstract deleteCertifications(user_id): Promise<AppResponse>;
	abstract deleteEducation(user_id): Promise<AppResponse>;
	abstract deleteOnlineProfile(onlineProfileId: any): Promise<AppResponse>;
	abstract getGenericMaster(query: any): Promise<AppResponse>;
	abstract getSkillMasterData(pageNo?: number): Promise<AppResponse>;
	abstract getCountryMaster(): Promise<AppResponse>;
	abstract getIndustryMaster(options: any): Promise<AppResponse>;
	abstract fetchCompanyNames(limit: any): Promise<AppResponse>;
	abstract fetchDesignation(limit: any): Promise<AppResponse>;
	abstract fetchDepartments(pageNo: any): Promise<AppResponse>;
	abstract fetchLocations(pageNo: any): Promise<AppResponse>;
	abstract fetchUniversities(pageNo: any): Promise<AppResponse>;
	abstract deleteLanguage({ claims, langId }): Promise<AppResponse>;
	abstract jobSeekerImageUpload(file: any): Promise<AppResponse>;
	abstract employerLogoUpload(file: any): Promise<AppResponse>;
	abstract jobSeekerVideoUpload(file: any): Promise<AppResponse>;
	abstract jobSeekerResumeUpload(file: any): Promise<AppResponse>;
	abstract getCategoryMasterData(categoryInfo: any, claims: AtPayload): Promise<AppResponse>;
	abstract getJobRoleMasterData(roleInfo: any, claims: AtPayload): Promise<AppResponse>;
	abstract getCertProvider(certificateInfo: any, claims: AtPayload): Promise<AppResponse>;
	abstract getSpecialization(specialization: any, claims: AtPayload): Promise<AppResponse>;
	abstract deleteJobseekerDoc(docRefObj: any): Promise<AppResponse>;
	abstract getCertName(certificateInfo: any, claims: AtPayload): Promise<AppResponse>;
}
