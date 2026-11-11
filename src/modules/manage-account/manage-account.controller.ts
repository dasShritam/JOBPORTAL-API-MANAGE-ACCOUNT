import { Authorize } from '@app/core/decorators/authorization.decorator';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import {
	Body,
	Controller,
	Delete,
	FileTypeValidator,
	Get,
	MaxFileSizeValidator,
	Param,
	ParseFilePipe,
	Patch,
	Post,
	Req,
	UploadedFile,
	UploadedFiles,
	UseInterceptors
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import {
	CommonMasterDto,
	CompanyDetailsDto,
	EmpAccountDetailsDto,
	GenericMasterDataDto,
	JobSeekerBasicDetailsDto,
	JobSeekerCareerDto,
	JobSeekerCertDto,
	JobSeekerEduDto,
	JobSeekerEmploymentDto,
	JobSeekerItSkillsDto,
	JobSeekerPersonalDetailsDto,
	JobSeekerPresentationDto,
	JobSeekerProjectDto,
	JobseekerOnlineProfileDto,
	MasterDataDto,
	NestedDto,
	PatentDto,
	PublicationDto,
	WorkSampleDto
} from './dto';
import { AbstractManageAccountSvc } from './manage-acccount.abstract';

@Controller('manageac')
@ApiTags('Manage Account')
export class ManageAccountController {
	constructor(private readonly _manageAcSvc: AbstractManageAccountSvc) {}

	@Authorize()
	@Patch('employer/companyInfo')
	async updateCompanyDetails(@Req() req: any, @Body() companyInfo: CompanyDetailsDto) {
		const companyData = {
			userid: req.claims.sub,
			data: companyInfo
		};
		return this._manageAcSvc.updateEmpCompanyDetails(companyData);
	}

	@Authorize()
	@Patch('employer/accountInfo')
	async updateEmployerAccdetails(@Req() req: any, @Body() accData: EmpAccountDetailsDto) {
		const data: any = {
			userid: req.claims.sub,
			accountDetails: accData
		};
		return this._manageAcSvc.upadteEmpAccdetails(data);
	}

	@Authorize()
	@Get('employerProfile')
	async getEmployeeProfile(@Req() req: any) {
		return this._manageAcSvc.getEmployerProfile(req.claims);
	}

	@Authorize()
	@Get('JobSeekerDetails')
	async getJobSeekerDetails(@Req() req: any): Promise<AppResponse> {
		return this._manageAcSvc.getJobSeekerDetails(req.claims.sub);
	}

	@Authorize()
	@Patch('jobSeekerProject')
	async updateJSProject(@Req() req: any, @Body() projectDetails: JobSeekerProjectDto) {
		const projectInfo = {
			user_id: req.claims.sub,
			projectDetails: projectDetails
		};

		return this._manageAcSvc.updateJSProject(projectInfo);
	}

	@Authorize()
	@Patch('jobseekerPPT')
	async updateJSOnlinePPT(@Req() req: any, @Body() pptDetails: JobSeekerPresentationDto) {
		const pptInfo = {
			user_id: req.claims.sub,
			pptDetails: pptDetails
		};
		return this._manageAcSvc.updateJSOnlinePpt(pptInfo);
	}

	@Authorize()
	@Patch('jobseekerProfile/keyskills')
	async updateKeySkills(@Req() req: any, @Body() skills: any) {
		return this._manageAcSvc.updateKeySkills(req.claims.sub, skills.key);
	}

	@Authorize()
	@Patch('JobSeekerEdu')
	async updateJobSeekerEduDetails(@Body() educationData: JobSeekerEduDto, @Req() req: any) {
		const eduInfo = { ...educationData, userid: req.claims.sub };
		return this._manageAcSvc.updateJobSeekerEduDetails(eduInfo);
	}

	@Authorize()
	@Patch('JobSeekerSkills')
	async updateJobSeekerItSkillDetails(@Req() req: any, @Body() iTSkills: JobSeekerItSkillsDto) {
		const skillInfo = {
			userid: req.claims.sub,
			iTSkills: iTSkills
		};
		return this._manageAcSvc.updateJobSeekerItSkills(skillInfo);
	}

	@Authorize()
	@Patch('jobseekerprofile/headline')
	async updateResumeHeadline(@Req() req: any, @Body() resumeHeader: string) {
		const headerInfo: any = {
			user_Id: req.claims.sub,
			resumeHeader: resumeHeader
		};
		return this._manageAcSvc.updateResumeHeaderAction(headerInfo);
	}

	@Authorize()
	@Patch('jobseekerprofile/summary')
	async updateProfileSummary(@Req() req: any, @Body() profileHeader: string) {
		const profileHeaderInfo: any = {
			user_Id: req.claims.sub,
			profileHeader: profileHeader
		};
		return this._manageAcSvc.updateProfileSummaryAction(profileHeaderInfo);
	}

	@Authorize()
	@Patch('publication')
	async updatePublications(@Req() req: any, @Body() info: PublicationDto) {
		const publInfo = {
			user_id: req.claims.sub,
			info: { ...info }
		};
		return this._manageAcSvc.updatePublication(publInfo);
	}

	@Authorize()
	@Patch('jobseekerPatent')
	async updatePatent(@Req() req: any, @Body() patentinfo: PatentDto) {
		const patentInfo = {
			user_Id: req.claims.sub,
			...patentinfo
		};
		return this._manageAcSvc.updatePatent(patentInfo);
	}

	@Authorize()
	@ApiParam({ name: 'id', required: true })
	@Delete('Publication/:id')
	async deletePublications(@Req() req: any, @Param() PublicationId: any) {
		const publicationInfo = {
			user_Id: req.claims.sub,
			publicationId: PublicationId
		};
		return this._manageAcSvc.deletePublication(publicationInfo);
	}

	@Authorize()
	@Post('jobSeekerRegFile')
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(
		FileFieldsInterceptor(
			[
				{ name: 'resume', maxCount: 1 },
				{ name: 'video', maxCount: 1 },
				{ name: 'image', maxCount: 1 }
			],
			{
				limits: { fileSize: 20971520 }
			}
		)
	)
	async jobSeekerRegFile(
		@Req() req: any,
		@UploadedFiles()
		files: { resume?: Express.Multer.File[]; video?: Express.Multer.File[]; image?: Express.Multer.File[] }
	) {
		const regInfo = {
			files,
			claims: req.claims
		};
		if (
			files?.resume &&
			files?.resume.length &&
			!/^application\/(pdf|doc|docx|msword)$/i.test(files?.resume[0]?.mimetype) &&
			files?.resume[0]?.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		) {
			return createResponse(206, messages.W18);
		}
		if (files?.video && files?.video.length && !/^video\/(m4v|mkv|mp4)$/i.test(files?.video[0]?.mimetype)) {
			return createResponse(206, messages.W17);
		}
		if (files?.image && files?.image.length && !/^image\/(jpe?g|png|)$/i.test(files?.image[0]?.mimetype)) {
			return createResponse(206, messages.W19);
		}
		return this._manageAcSvc.jobSeekerRegFile(regInfo);
	}

	@Authorize()
	@Post('employer/uploadComLogo')
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('companyLogo'))
	async uploadEmployerCompanyLogo(
		@Req() req: any,
		@UploadedFile(
			new ParseFilePipe({
				validators: [new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }), new MaxFileSizeValidator({ maxSize: 104857600 })]
			})
		)
		file: Express.Multer.File
	) {
		const logoInfo = {
			file,
			claims: req.claims
		};
		return this._manageAcSvc.uploadEmployerCompanyLogo(logoInfo);
	}

	@Authorize()
	@Patch('jobseekerCareer')
	async updateJobseekerCareer(@Req() req: any, @Body() careerDetails: JobSeekerCareerDto) {
		const careerInfo = {
			userid: req.claims.sub,
			careerDetails: careerDetails
		};
		return this._manageAcSvc.updateJobseekerCareer(careerInfo);
	}

	@Authorize()
	@Patch('jobseekerEmployement')
	async updateEmployment(@Req() req: any, @Body() employementInfo: JobSeekerEmploymentDto) {
		const employmentInfo = {
			user_id: req.claims.sub,
			...employementInfo
		};
		return this._manageAcSvc.updateJobseekerEmployement(employmentInfo);
	}

	@Authorize()
	@Patch('jobSeekerCertificate')
	async updateJobSeekerCerticateDetails(@Req() req: any, @Body() certificateDetails: JobSeekerCertDto) {
		const certInfo = {
			user_id: req.claims.sub,
			certificateDetails: certificateDetails
		};
		return this._manageAcSvc.updateJobSeekerCertificate(certInfo);
	}

	@Authorize()
	@Patch('jobseekerPersonalDetails')
	async updateJobseekerPersonalDetails(@Req() req: any, @Body() personaldetails: JobSeekerPersonalDetailsDto) {
		const personalInfo = {
			user_id: req.claims.sub,
			personaldetails: personaldetails
		};
		return this._manageAcSvc.updateJobSeekerPersonalDetails(personalInfo);
	}

	@Authorize()
	@Patch('worksample')
	async updateWorkSample(@Req() req: any, @Body() data: WorkSampleDto) {
		const workInfo = { user_id: req.claims.sub, data: data };
		return this._manageAcSvc.updateWorkSample(workInfo);
	}

	@Authorize()
	@Patch('jobseekerProfile/onlineProfile')
	async updateJSOnlineProfile(@Req() req: any, @Body() onlineProfileDetails: JobseekerOnlineProfileDto) {
		const profileInfo = {
			user_id: req.claims.sub,
			profileDetails: onlineProfileDetails
		};
		return this._manageAcSvc.updataJSOnlineProfile(profileInfo);
	}

	@Authorize()
	@Patch('jobseekerBasicDetails')
	async updateJobSeekerBasicDetails(@Req() req: any, @Body() basicDetails: JobSeekerBasicDetailsDto) {
		const basicInfo = {
			user_id: req.claims.sub,
			careerDetails: basicDetails
		};
		return this._manageAcSvc.updateJobSeekerBasicDetails(basicInfo);
	}

	@Get('profilemeter')
	@Authorize()
	async profileMeter(@Req() req: any): Promise<AppResponse> {
		return this._manageAcSvc.profileMeter(req.claims);
	}

	@Authorize()
	@ApiBearerAuth()
	@Get('downloadResume')
	async downloadResume(@Req() req: any) {
		return this._manageAcSvc.downloadResume(req.claims);
	}

	@Authorize()
	@ApiBearerAuth()
	@Get('downloadImage')
	async downloadImage(@Req() req: any) {
		return this._manageAcSvc.downloadImage(req.claims);
	}

	@Authorize()
	@ApiBearerAuth()
	@Get('downloadCompanyLogo')
	async downloadCompanyLogo(@Req() req: any) {
		return this._manageAcSvc.downloadCompanyLogo(req.claims);
	}

	@Authorize()
	@ApiBearerAuth()
	@Get('downloadVideo')
	async downloadVideo(@Req() req: any) {
		return this._manageAcSvc.downloadVideo(req.claims);
	}

	@ApiParam({ name: 'id', required: true })
	@Delete('employement/:id')
	@Authorize()
	async removeEmployement(@Req() req: any, @Param() Id: any): Promise<AppResponse> {
		const employmentInfo = {
			userid: req.claims.sub,
			employementid: Id.id
		};
		return this._manageAcSvc.deleteEmployement(employmentInfo);
	}

	@Authorize()
	@ApiParam({ name: 'id', required: true })
	@Delete('Presentation/:id')
	async deletePresentation(@Req() req: any, @Param() PresentationId: string) {
		const presentationObj = {
			claims: req.claims,
			presentationId: PresentationId
		};
		return this._manageAcSvc.deletePresentation(presentationObj);
	}

	@Authorize()
	@ApiParam({ name: 'id', required: true })
	@Delete('jobseekerPatent/:id')
	async deletejobseekerPatent(@Req() req: any, @Param() patentId: any) {
		const patentInfo = {
			user_Id: req.claims.sub,
			patentId: patentId.id
		};
		return this._manageAcSvc.deletePatent(patentInfo);
	}

	@Authorize()
	@ApiParam({ name: 'id', required: true })
	@Delete('JobSeekerSkills/:id')
	async deleteJobSeekerItSkillDetails(@Req() req: any, @Param() iTSkillsId: any) {
		const skillsInfo = {
			user_Id: req.claims.sub,
			iTSkillsId: iTSkillsId
		};
		return this._manageAcSvc.deleteJobSeekerItSkillDetails(skillsInfo);
	}

	@Authorize()
	@ApiParam({ name: 'id', required: true })
	@Delete('worksample/:id')
	async deleteWorksample(@Req() req: any, @Param() worksampleID: any) {
		const workSampleInfo = { user_id: req.claims.sub, info: worksampleID };
		return this._manageAcSvc.deleteWorksample(workSampleInfo);
	}

	@Authorize()
	@ApiParam({ name: 'id', required: true })
	@Delete('Certification/:id')
	async deleteCertifications(@Req() req: any, @Param() CertificateId: any) {
		const certInfo = {
			user_Id: req.claims.sub,
			CertificateId: CertificateId
		};
		return this._manageAcSvc.deleteCertifications(certInfo);
	}

	@Authorize()
	@ApiParam({ name: 'id', required: true })
	@Delete('OnlineProfile/:id')
	async deleteOnlineProfile(@Req() req: any, @Param() OnlineProfileId: string) {
		const onlineInfo = {
			user_Id: req.claims.sub,
			OnlineProfileId: OnlineProfileId
		};
		return this._manageAcSvc.deleteOnlineProfile(onlineInfo);
	}

	@Authorize()
	@ApiParam({ name: 'id', required: true })
	@Delete('JobSeekerEdu/:id')
	async deleteJobSeekerEduDetails(@Req() req: any, @Param('id') EducationId: any) {
		const eduInfo = {
			user_id: req.claims.sub,
			educationId: EducationId
		};
		return this._manageAcSvc.deleteEducation(eduInfo);
	}

	@Authorize()
	@Delete('jobseekerDoc/:name')
	@ApiParam({ name: 'name', required: true })
	async deleteJobseekerDoc(@Req() req: any, @Param() docRef: any) {
		const docRefObj = {
			claims: req.claims,
			docRef: docRef
		};
		return this._manageAcSvc.deleteJobseekerDoc(docRefObj);
	}

	@Authorize()
	@ApiParam({ name: 'id', required: true })
	@Delete('jobSeekerProject/:id')
	async deleteProject(@Req() req: any, @Param('id') id: string) {
		const projectInfo = {
			user_id: req.claims.sub,
			_id: id
		};
		return this._manageAcSvc.deleteProject(projectInfo);
	}

	@Authorize()
	@Post('masterdata')
	async getGenericMaster(@Body() options: [GenericMasterDataDto]) {
		return this._manageAcSvc.getGenericMaster(options);
	}

	@Authorize()
	@Post('skillMasterData')
	async getSkillMasterData(@Body() options: any) {
		return this._manageAcSvc.getSkillMasterData(options);
	}

	@Get('masterCountry')
	async getCountryMaster() {
		return this._manageAcSvc.getCountryMaster();
	}

	@Post('masterIndustry')
	async getIndustryMaster(@Body() options: any) {
		return this._manageAcSvc.getIndustryMaster(options);
	}

	@Authorize()
	@Post('companynames')
	async getCompanyNames(@Body() options: any) {
		return this._manageAcSvc.getCompanyNames(options);
	}

	@Authorize()
	@Post('designations')
	async getDesignations(@Body() options: any) {
		return this._manageAcSvc.getDesignations(options);
	}

	@Authorize()
	@Post('commonmaster')
	async getCommonMaster(@Body() body: [CommonMasterDto]) {
		return this._manageAcSvc.getCommonMaster(body);
	}

	@Authorize()
	@Post('departments')
	async getDepartments(@Body() options: any) {
		return this._manageAcSvc.getDepartments(options);
	}

	@Authorize()
	@Post('locations')
	async getLocations(@Body() options: any) {
		return this._manageAcSvc.getLocationsData(options);
	}

	@Authorize()
	@Post('universities')
	async getUniversities(@Body() options: any) {
		return this._manageAcSvc.getUniversitiesData(options);
	}

	@Authorize()
	@ApiParam({ name: 'id', required: true })
	@Delete('language/:id')
	async deleteLanguage(@Req() req: any, @Param() LangId: string) {
		const langObj = {
			claims: req.claims,
			langId: LangId
		};
		return this._manageAcSvc.deleteLanguage(langObj);
	}

	@Authorize()
	@Post('jobroleCategory')
	async getCategoryMaster(@Req() req: any, @Body() category: NestedDto) {
		return this._manageAcSvc.getCategoryMasterData(category, req.claims);
	}

	@Authorize()
	@Post('jobroles')
	async getJobRoleMaster(@Req() req: any, @Body() role: NestedDto) {
		return this._manageAcSvc.getJobRoleMasterData(role, req.claims);
	}

	@Authorize()
	@Post('certProvider')
	async getCertProvider(@Req() req: any, @Body() certProvider: MasterDataDto) {
		return this._manageAcSvc.getCertificationProvider(certProvider, req.claims);
	}

	@Authorize()
	@Post('specialization')
	async getSpecialization(@Req() req: any, @Body() specialization: NestedDto) {
		return this._manageAcSvc.getSpecializationData(specialization, req.claims);
	}

	@Authorize()
	@Post('certName')
	async getCertName(@Req() req: any, @Body() certName: MasterDataDto) {
		return this._manageAcSvc.getCertificationName(certName, req.claims);
	}
}
