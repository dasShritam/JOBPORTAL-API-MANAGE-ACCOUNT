import { AppConfigService } from '@app/config/appconfig.service';
import AppLogger from '@app/core/logger/app-logger';
import { AccountMailService } from '@app/core/mail/mail.service';
import { convert_date_unix_ts, unix_ts_now } from '@app/core/utils/timestamp.utils';
import { DatabaseService } from '@app/database/database.service';
import { AbstractManageAccountDao } from '@app/database/mongo/abstract/manage-account.abstract';
import { ProfileEmployerModel } from '@app/database/mongo/models/profile.employer.model';
import { ProfileJobSeekerModel } from '@app/database/mongo/models/profile.jobseeker.model';
import { UserAccountModel } from '@app/database/mongo/models/security.user-account.model';
import { MASTER_SCHEMA_GROUP } from '@app/database/mongo/schemas';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messageFactory, messages } from '@app/shared/messages.shared';
import { BlobServiceClient } from '@azure/storage-blob';
import { HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Types } from 'mongoose';
import { fullMonthList, halfMonthList } from '@app/core/constants/month-names.constant';
import { CompanyDetailsDto } from './models/company-info.model';
import { empAccountDto } from './models/employer.model';
import { JobSeekerEdu } from './models/jobseeker.model';
import { AbstractManageAccountSvc } from './manage-acccount.abstract';
import { blobInfo } from './models/blob-principle.model';
import { AtPayload } from './models/jwt-payload.model';
@Injectable()
export class ManageAccountService implements AbstractManageAccountSvc {
	private readonly _manageAcTxn: AbstractManageAccountDao;
	constructor(
		private readonly _appConfigSvc: AppConfigService,
		private readonly _loggerSvc: AppLogger,
		readonly _dbSvc: DatabaseService,
		private _mailService: AccountMailService
	) {
		this._manageAcTxn = _dbSvc.manageAcTxn;
	}

	//#region ping
	async ping(): Promise<AppResponse> {
		try {
			return createResponse(200, messages.S1);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region get emp profile
	async getEmployerProfile(claims: any): Promise<AppResponse> {
		try {
			const res = await this._manageAcTxn.getEmployerProfile(claims.sub);
			return createResponse(HttpStatus.OK, messages.S3, res);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, `${claims.sid}`);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#endregion get emp profile

	async updateEmpCompanyDetails(companyDetails: CompanyDetailsDto): Promise<AppResponse> {
		try {
			const company_info = companyDetails.data.company_info,
				userid = companyDetails.userid;
			return this._manageAcTxn.updateCompanyDetails(userid, company_info);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async upadteEmpAccdetails(accountdetails: empAccountDto): Promise<AppResponse> {
		try {
			return this._manageAcTxn.UpdateEmpAccountInfo(accountdetails);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async getJobSeekerDetails(id: string): Promise<AppResponse> {
		try {
			return this._manageAcTxn.getJobSeekerDetails(id);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateJSProject({ user_id: any, projectDetails: JobSeekerProject }): Promise<AppResponse> {
		try {
			return this._manageAcTxn.updateJSProject({ user_id: any, projectDetails: JobSeekerProject });
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateJSOnlinePpt({ user_id: any, pptDetails: JobSeekerPresentation }): Promise<AppResponse> {
		try {
			return this._manageAcTxn.updateJSOnlinePpt({ user_id: any, pptDetails: JobSeekerPresentation });
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateKeySkills(sessionId, keySkills: string[]): Promise<AppResponse> {
		try {
			return this._manageAcTxn.updateKeySkills(sessionId, keySkills);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region JobSeekerEducation
	async updateJobSeekerEduDetails(education: JobSeekerEdu): Promise<AppResponse> {
		try {
			if (education.type == 'school') {
				if (education.board && education.passingOutYear && education.schoolMedium && education.totalMarks) {
					return this._manageAcTxn.updateJobSeekerEduDetails(education);
				} else {
					const msg = messageFactory(messages.W2, ['Board,PassingOutYear,SchoolMedium,TotalMarks fields']);
					return createResponse(HttpStatus.BAD_REQUEST, msg);
				}
			} else {
				if (
					education.universityInstitute &&
					education.course &&
					education.specialization &&
					education.courseType &&
					education.courseDurationStart &&
					education.courseDurationEnd
				) {
					if (education.gradingSystem && education.gradingSystem !== 'Course Requries a Pass') {
						if (!education.marks) {
							const msg = messageFactory(messages.W2, ['Mark fields']);
							return createResponse(HttpStatus.BAD_REQUEST, msg);
						}
					}
					return this._manageAcTxn.updateJobSeekerEduDetails(education);
				} else {
					const msg = messageFactory(messages.W2, [
						'UniversityInstitute,Course,Specialization,CourseType,CourseDurationStart,CourseDurationEnd fields'
					]);
					return createResponse(HttpStatus.BAD_REQUEST, msg);
				}
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#endregion

	//#region JobSeekerItSkills
	async updateJobSeekerItSkills(iTSkills: any): Promise<AppResponse> {
		return this._manageAcTxn.updateJobSeekerItSkills(iTSkills);
	}

	async updatePublication(publicationData: any): Promise<AppResponse> {
		const { user_id, info } = publicationData;
		return this._manageAcTxn.updatePublication(user_id, info);
	}

	//#endregion

	//#region JobSeekerPatent

	async updatePatent(patentInfo: any): Promise<AppResponse> {
		try {
			if (patentInfo.issued_month >= 0 && patentInfo.issued_year) {
				const date = new Date(patentInfo.issued_year, patentInfo.issued_month, 1);
				const time = convert_date_unix_ts(date);
				patentInfo.issued_ts = time;
			}
			return this._manageAcTxn.updatePatent(patentInfo);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async deletePublication(publication: any): Promise<AppResponse> {
		try {
			// const { user_id, info } = publicationData;
			return this._manageAcTxn.deletePublication(publication);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateResumeHeaderAction(header: any): Promise<AppResponse> {
		try {
			return this._manageAcTxn.updateResumeHeaderAction(header);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateProfileSummaryAction(summary: any): Promise<AppResponse> {
		try {
			return this._manageAcTxn.updateProfileSummaryAction(summary);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateJobseekerCareer(careerDetails: any): Promise<AppResponse> {
		// const {user_id,careerDetails}=data
		return this._manageAcTxn.updateJobseekerCareer(careerDetails);
	}
	//#endregion

	//#region JobSeekerCerificate
	async updateJobSeekerCertificate(certificateDetails: any): Promise<any> {
		try {
			return this._manageAcTxn.patchCertificate(certificateDetails);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region JobSeekerPersonalDetails
	async updateJobSeekerPersonalDetails(PersonalDetails: any): Promise<any> {
		try {
			return this._manageAcTxn.updateJobSeekerPersonalDetails(PersonalDetails);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	/*Upload file blob*/
	async uploadFileToBlob(blobInfo: blobInfo): Promise<AppResponse> {
		try {
			const blobData = this._appConfigSvc.get('blobStorage'),
				connString = blobData.blobAccountConnectionString,
				containerName = blobInfo.blobContainerName,
				blobServiceClient = BlobServiceClient.fromConnectionString(connString),
				blobContainer = blobServiceClient.getContainerClient(containerName),
				blobDirectory = blobInfo.dirName,
				fileName = blobContainer.getBlockBlobClient(`${blobDirectory}/${blobInfo.fileName}`),
				fileData = Buffer.from(blobInfo.file);
			const uploadRes = await fileName.uploadData(fileData);
			if (uploadRes?._response?.status !== HttpStatus.CREATED) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.E14);
			}
			return createResponse(HttpStatus.OK, messages.S3, blobInfo.fileName);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//For employer - company logo
	async uploadEmpFileToBlob(blobInfo: blobInfo): Promise<AppResponse> {
		try {
			const blobData = this._appConfigSvc.get('blobStorage'),
				connString = blobData.blobAccountConnectionString,
				containerName = blobInfo.blobContainerName,
				blobServiceClient = BlobServiceClient.fromConnectionString(connString),
				blobContainer = blobServiceClient.getContainerClient(containerName),
				blobDirectory = blobInfo.dirName,
				fileName = blobContainer.getBlockBlobClient(`${blobDirectory}/${blobInfo.fileName}`),
				fileData = Buffer.from(blobInfo.file);
			const uploadRes = await fileName.uploadData(fileData);
			if (uploadRes?._response?.status !== HttpStatus.CREATED) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.E14);
			}
			return createResponse(HttpStatus.OK, messages.S3, blobInfo.fileName);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async jobSeekerRegFile(files: any): Promise<AppResponse> {
		try {
			const blobData = this._appConfigSvc.get('blobStorage');
			if (files?.files?.resume) {
				const resumeInfo = {
					blobContainerName: blobData.blobJobSeekerContainer,
					dirName: `${files.claims.sub}/resume`,
					fileName: `${unix_ts_now()}-${files.files.resume[0].originalname}`,
					file: files.files.resume[0].buffer
				};
				const resumeRes = await this.uploadFileToBlob(resumeInfo);
				if (resumeRes?.code === 200) {
					const options: ProfileJobSeekerModel = {
						user_id: files.claims.sub,
						cp: {
							cv: {
								name: resumeRes.data
							}
						}
					};
					const dbRes = await this._manageAcTxn.jobSeekerResumeUpload(options);
					if (dbRes.code !== 200) {
						return createResponse(HttpStatus.BAD_REQUEST, messages.E2);
					}
				} else {
					return createResponse(HttpStatus.BAD_REQUEST, messages.E2);
				}
			}

			if (files?.files?.video) {
				const videoInfo = {
					blobContainerName: blobData.blobJobSeekerContainer,
					dirName: `${files.claims.sub}/video`,
					fileName: `${unix_ts_now()}-${files.files.video[0].originalname}`,
					file: files.files.video[0].buffer
				};
				const videoRes = await this.uploadFileToBlob(videoInfo);

				if (videoRes?.code === 200) {
					const options: ProfileJobSeekerModel = {
						user_id: files.claims.sub,
						profile: {
							siv: {
								name: videoRes.data
							}
						}
					};
					const dbRes = await this._manageAcTxn.jobSeekerVideoUpload(options);
					if (dbRes.code !== 200) {
						return createResponse(HttpStatus.BAD_REQUEST, messages.E2);
					}
				} else {
					return createResponse(HttpStatus.BAD_REQUEST, messages.E2);
				}
			}

			if (files?.files?.image) {
				const imageInfo = {
					blobContainerName: blobData.blobJobSeekerContainer,
					dirName: `${files.claims.sub}/image`,
					fileName: `${unix_ts_now()}-${files.files.image[0].originalname}`,
					file: files.files.image[0].buffer
				};
				const imageRes = await this.uploadFileToBlob(imageInfo);

				if (imageRes?.code === 200) {
					const options: ProfileJobSeekerModel = {
						user_id: files.claims.sub,
						profile: {
							img: {
								name: imageRes.data
							}
						}
					};
					const dbRes = await this._manageAcTxn.jobSeekerImageUpload(options);
					if (dbRes.code !== 200) {
						return createResponse(HttpStatus.BAD_REQUEST, messages.E2);
					}
				} else {
					return createResponse(HttpStatus.BAD_REQUEST, messages.E2);
				}
			}
			if (files?.files?.resume || files?.files?.video || files?.files?.image) {
				return createResponse(HttpStatus.OK, messages.S33);
			} else {
				return createResponse(HttpStatus.BAD_REQUEST, messages.E13);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async uploadEmployerCompanyLogo(file: any): Promise<AppResponse> {
		try {
			const blobData = this._appConfigSvc.get('blobStorage');
			const imageInfo = {
				blobContainerName: blobData.blobEmployerContainer,
				dirName: `${file.claims.sub}/logo`,
				fileName: `${unix_ts_now()}-${file.file.originalname}`,
				file: file.file.buffer
			};

			const imageRes = await this.uploadEmpFileToBlob(imageInfo);
			if (imageRes?.code === 200) {
				const options: ProfileEmployerModel = {
					user_id: file.claims.sub,
					profile: {
						logo: {
							name: imageRes.data
						}
					}
				};
				const dbRes = await this._manageAcTxn.employerLogoUpload(options);
				if (dbRes.code !== 200) {
					return createResponse(HttpStatus.BAD_REQUEST, messages.E2);
				}
				return createResponse(HttpStatus.OK, messages.S33);
			} else {
				return createResponse(HttpStatus.BAD_REQUEST, messages.E2);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateWorkSample(workSample: any): Promise<AppResponse> {
		try {
			const { user_id, data } = workSample;
			const startmonth = new Date(`${data.DurationFrommonth} 1`).getMonth() + 1;
			const endmonth = new Date(`${data.DurationTomonth} 1`).getMonth() + 1;

			if (data.DurationTomonth && data.DurationTo && endmonth && data.DurationFrom > data.DurationTo) {
				return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W10);
			} else if (data.DurationFrom == data.DurationFrommonth && startmonth < endmonth) {
				return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W11);
			} else {
				return this._manageAcTxn.updateWorkSample(user_id, data);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region job seeker Emploement
	async updateJobseekerEmployement(employement: any): Promise<AppResponse> {
		try {
			const start_date = new Date(employement.start_year, employement.start_month, 1);
			let lastday = null;
			const joiningDate = convert_date_unix_ts(start_date);
			if (employement.end_year) {
				const end_date = new Date(employement.end_year, employement.end_month, 1);
				lastday = convert_date_unix_ts(end_date);
			}
			let noticeDate = null;
			if (employement.fullTime && employement.fullTime.noticePeriod.end_year) {
				const n_end_date = new Date(
					employement.fullTime.noticePeriod.end_year,
					employement.fullTime.noticePeriod.end_month,
					employement.fullTime.noticePeriod.end_day
				);
				noticeDate = convert_date_unix_ts(n_end_date);
			}
			employement.start_ts = joiningDate;
			employement.end_ts = lastday;
			employement.notice_end_ts = noticeDate;

			return this._manageAcTxn.updateJobseekerEmployement(employement);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#end region

	//#region JobseekeronlineProfile
	async updataJSOnlineProfile({ user_id: any, profileDetails: JobseekerOnlineProfile }): Promise<AppResponse> {
		try {
			return this._manageAcTxn.updateJSOnlineProfile({ user_id: any, profileDetails: JobseekerOnlineProfile });
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateJobSeekerBasicDetails(basicDetails: any): Promise<AppResponse> {
		try {
			return this._manageAcTxn.updateJobSeekerBasicDetails(basicDetails);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	/*Calculate jobseeker profile progress*/
	private async calcualteprofileMeter(profileInfo: any): Promise<AppResponse> {
		try {
			const profileWeightage = this._appConfigSvc.get('jsProfileWeightage');
			let completionPercentage = 0,
				profileVal = '',
				fieldWeightage = 0;

			for (const key in profileWeightage) {
				if (Object.prototype.hasOwnProperty.call(profileWeightage, key)) {
					profileVal = profileInfo[key];
					if (profileVal) {
						fieldWeightage = 0;
						if (Array.isArray(profileVal)) {
							if (profileVal.length) {
								fieldWeightage = profileWeightage[key];
							}
						} else if (!Array.isArray(profileVal)) {
							fieldWeightage = profileWeightage[key];
						}
						if (fieldWeightage) {
							completionPercentage += Number(fieldWeightage);
						}
					}
				}
			}
			const output = { id: profileInfo.user_id, name: profileInfo.name, username: profileInfo.uname, completionPercentage, profileWeightage };
			return createResponse(HttpStatus.OK, messages.S3, output);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	/*Fetch jobseeker profile completion percentage*/

	async profileMeter(claims: any): Promise<AppResponse> {
		try {
			/*Fetch user account info*/
			const userAcOpts: UserAccountModel = {
					_id: new Types.ObjectId(claims.sub)
				},
				userAcRes = await this._manageAcTxn.fetchUserInfo(userAcOpts);
			if (userAcRes.code !== 200) return userAcRes;

			/*Fetch jobseeker profile details*/
			const jsProfileOpts: ProfileJobSeekerModel = {
					user_id: new Types.ObjectId(claims.sub)
				},
				jsProfileRes = await this._manageAcTxn.fetchJobseekerInfo(jsProfileOpts);
			if (jsProfileRes.code !== 200) return jsProfileRes;

			/*Calculate profile completion*/
			return this.calcualteprofileMeter({ ...userAcRes.data[0], ...jsProfileRes.data[0] });
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async downloadResume(claims: any): Promise<AppResponse> {
		try {
			const options: ProfileJobSeekerModel = { user_id: new Types.ObjectId(claims.sub) },
				dbRes = await this._manageAcTxn.fetchJobseekerInfo(options),
				resumeName = dbRes?.data[0]?.cv,
				blobCred = this._appConfigSvc.get('blobStorage'),
				blobServiceClient = BlobServiceClient.fromConnectionString(blobCred.blobAccountConnectionString),
				blobSasURI = blobServiceClient.generateAccountSasUrl(new Date(new Date().valueOf() + 60000 * blobCred.linkValidity)),
				spltSasUri = blobSasURI.split('?');
			return createResponse(
				HttpStatus.OK,
				messages.S3,
				`${spltSasUri[0]}${blobCred.blobJobSeekerContainer}/${claims.sub}/resume/${resumeName}?${spltSasUri[1]}`
			);
		} catch (error) {
			if (error?.response?.status === HttpStatus.NOT_FOUND) {
				this._loggerSvc.error(error.response.statusText, HttpStatus.NOT_FOUND);
				return createResponse(HttpStatus.NOT_FOUND, messages.E13);
			} else {
				this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
				return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			}
		}
	}

	async downloadImage(claims: any): Promise<AppResponse> {
		try {
			const options: ProfileJobSeekerModel = { user_id: new Types.ObjectId(claims.sub) },
				dbRes = await this._manageAcTxn.fetchJobseekerInfo(options),
				imageName = dbRes?.data[0]?.profile?.img?.name,
				blobCred = this._appConfigSvc.get('blobStorage'),
				blobServiceClient = BlobServiceClient.fromConnectionString(blobCred.blobAccountConnectionString),
				blobSasURI = blobServiceClient.generateAccountSasUrl(new Date(new Date().valueOf() + 60000 * blobCred.linkValidity)),
				spltSasUri = blobSasURI.split('?'),
				buffer = (
					await axios({
						method: 'GET',
						url: `${spltSasUri[0]}${blobCred.blobJobSeekerContainer}/${claims.sub}/image/${imageName}?${spltSasUri[1]}`,
						headers: {
							'content-type': 'image/jpeg'
						},
						responseType: 'arraybuffer'
					})
				).data;

			return createResponse(HttpStatus.OK, messages.S3, buffer.toString('base64'));
		} catch (error) {
			if (error?.response?.status === HttpStatus.NOT_FOUND) {
				this._loggerSvc.error(error.response.statusText, HttpStatus.NOT_FOUND);
				return createResponse(HttpStatus.NOT_FOUND, messages.E12);
			} else {
				this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
				return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			}
		}
	}

	async downloadCompanyLogo(claims: any): Promise<AppResponse> {
		try {
			const options: ProfileEmployerModel = { user_id: new Types.ObjectId(claims.sub) },
				dbRes = await this._manageAcTxn.fetchEmployerInfo(options),
				imageName = dbRes?.data[0]?.profile?.logo?.name,
				blobCred = this._appConfigSvc.get('blobStorage'),
				blobServiceClient = BlobServiceClient.fromConnectionString(blobCred.blobAccountConnectionString),
				blobSasURI = blobServiceClient.generateAccountSasUrl(new Date(new Date().valueOf() + 60000 * blobCred.linkValidity)),
				spltSasUri = blobSasURI.split('?'),
				buffer = (
					await axios({
						method: 'GET',
						url: `${spltSasUri[0]}${blobCred.blobEmployerContainer}/${claims.sub}/logo/${imageName}?${spltSasUri[1]}`,
						headers: {
							'content-type': 'image/jpeg'
						},
						responseType: 'arraybuffer'
					})
				).data;

			return createResponse(HttpStatus.OK, messages.S3, buffer.toString('base64'));
		} catch (error) {
			if (error?.response?.status === HttpStatus.NOT_FOUND) {
				this._loggerSvc.error(error.response.statusText, HttpStatus.NOT_FOUND);
				return createResponse(HttpStatus.NOT_FOUND, messages.E12);
			} else {
				this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
				return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			}
		}
	}

	async downloadVideo(claims: any): Promise<AppResponse> {
		try {
			const options: ProfileJobSeekerModel = { user_id: new Types.ObjectId(claims.sub) },
				dbRes = await this._manageAcTxn.fetchJobseekerInfo(options),
				videoName = dbRes?.data[0]?.intro_video,
				blobCred = this._appConfigSvc.get('blobStorage'),
				blobServiceClient = BlobServiceClient.fromConnectionString(blobCred.blobAccountConnectionString),
				blobSasURI = blobServiceClient.generateAccountSasUrl(new Date(new Date().valueOf() + 60000 * blobCred.linkValidity)),
				spltSasUri = blobSasURI.split('?');
			return createResponse(
				HttpStatus.OK,
				messages.S3,
				`${spltSasUri[0]}${blobCred.blobJobSeekerContainer}/${claims.sub}/video/${videoName}?${spltSasUri[1]}`
			);
		} catch (error) {
			if (error?.response?.status === HttpStatus.NOT_FOUND) {
				this._loggerSvc.error(error.response.statusText, HttpStatus.NOT_FOUND);
				return createResponse(HttpStatus.NOT_FOUND, messages.E13);
			} else {
				this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
				return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			}
		}
	}
	//#endregion

	//#region delete employement

	async deleteEmployement(deleteEmployement: any): Promise<AppResponse> {
		try {
			return this._manageAcTxn.deleteEmployement(deleteEmployement);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#endregion

	async deleteOnlineProfile(userData: any): Promise<AppResponse> {
		try {
			return this._manageAcTxn.deleteOnlineProfile(userData);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async deletePatent(patent: any): Promise<AppResponse> {
		try {
			return this._manageAcTxn.deletePatent(patent);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async deleteJobSeekerItSkillDetails(ITSkills: any): Promise<AppResponse> {
		try {
			return this._manageAcTxn.deleteJobSeekerItSkillDetails(ITSkills);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#startregion of worksample
	async deleteWorksample(worksample: any): Promise<AppResponse> {
		return this._manageAcTxn.deleteWorksample(worksample);
	}
	//#endregion of worksample

	async deleteCertifications(CertificateId: any): Promise<AppResponse> {
		try {
			// const { user_id, info } = publicationData;
			return this._manageAcTxn.deleteCertifications(CertificateId);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async deleteEducation(education: any): Promise<AppResponse> {
		try {
			return this._manageAcTxn.deleteEducation(education);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region DELETE PROJECT
	async deleteProject(data: any): Promise<AppResponse> {
		try {
			return this._manageAcTxn.deleteProject(data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	async deletePresentation(presentationObj: any): Promise<AppResponse> {
		try {
			return this._manageAcTxn.deletePresentation(presentationObj);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async getSkillMasterData(options: any): Promise<AppResponse> {
		try {
			const skills = await this._manageAcTxn.getSkillMasterData(options);
			const resdata = skills.data.map((skill) => skill.name);
			return createResponse(HttpStatus.OK, '', resdata);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#region masterdata Country & Industry
	async getCountryMaster(): Promise<AppResponse> {
		return this._manageAcTxn.getCountryMaster();
	}
	async getIndustryMaster(options): Promise<AppResponse> {
		try {
			const inds = await this._manageAcTxn.getIndustryMaster(options);
			const resData = inds.data.map((ind) => ind.name);
			return createResponse(HttpStatus.OK, '', resData);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region MasterData
	async getCompanyNames(options: any): Promise<AppResponse> {
		try {
			const res = await this._manageAcTxn.fetchCompanyNames(options);
			const resData = res.data.map((company) => {
				return company.name;
			});
			return createResponse(HttpStatus.OK, '', resData);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async getDesignations(options: number): Promise<AppResponse> {
		try {
			const res = await this._manageAcTxn.fetchDesignation(options);
			const resData = res.data.map((desg) => {
				return desg.name;
			});
			return createResponse(HttpStatus.OK, messages.S3, resData);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async getGenericMaster(options: any): Promise<AppResponse> {
		let groups: any;
		try {
			const isAll = options.some((opt) => opt.group.toLowerCase() === 'all'),
				allEnum = Object.values(MASTER_SCHEMA_GROUP).filter((v) => isNaN(Number(v)));

			if (isAll) {
				groups = [
					{
						grp: { $in: allEnum }
					}
				];
			} else {
				groups = options.map((option) => {
					const query = {
						grp: option.group
					};
					if (option.active === 1 || option.active === 0) {
						query['active'] = Boolean(option.active);
					}
					return query;
				});
			}
			const data = await this._manageAcTxn.getGenericMaster(groups);

			return createResponse(HttpStatus.OK, messages.S3, data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	getFutureYears(params): number[] {
		const currentYear = new Date().getFullYear();
		const yearList: number[] = [currentYear];
		for (let index = 1; index < params.years; index++) {
			yearList.push(currentYear + index);
		}
		return yearList;
	}

	getYearOfExp(params) {
		const yearList: string[] = ['0 Year', '1 Year'];
		for (let index = 2; index < params.years + 1; index++) {
			yearList.push(index + ' Years');
		}
		return yearList.map((yearOfExp, index) => {
			return { value: yearOfExp, id: index };
		});
	}

	getMonthOfExp() {
		const monthList: string[] = ['0 Month', '1 Month'];
		for (let index = 2; index < 12; index++) {
			monthList.push(index + ' Months');
		}
		return monthList.map((monthOfExp, index) => {
			return { value: monthOfExp, id: index };
		});
	}
	getPastYears(params) {
		const previous = 50;
		const currentYear = new Date().getFullYear();
		const startYear = currentYear - previous;
		const yearList: string[] = [];
		for (let index = 1; index <= previous + params.futureYears; index++) {
			yearList.push((startYear + index).toString());
		}
		return yearList;
	}

	getMonths(params): any[] {
		const monthList = params.isHalfMonth ? [...halfMonthList] : [...fullMonthList];

		return monthList.map((month, index) => {
			return { value: month, id: index };
		});
	}

	commonMasterData(options) {
		try {
			let res = [];
			for (let i = 0; i < options.length; i++) {
				const parameters: any = {};
				let response = {};
				switch (options[i].group) {
					case 'FUYE':
						options[i].params.map((param) => {
							parameters[param.key] = param.value;
						});
						const getFutureYears = this.getFutureYears(parameters);
						response = {
							group: options[i].group,
							data: getFutureYears
						};
						res = [...res, response];
						break;
					case 'YOEP':
						options[i].params.map((param) => {
							parameters[param.key] = param.value;
						});
						const getYearOfExp = this.getYearOfExp(parameters);

						response = {
							group: options[i].group,
							data: getYearOfExp
						};
						res = [...res, response];
						break;
					case 'MOEP':
						const getMonthOfExp = this.getMonthOfExp();

						response = {
							group: options[i].group,
							data: getMonthOfExp
						};
						res = [...res, response];

						break;
					case 'PAYE':
						options[i].params.map((param) => {
							parameters[param.key] = param.value;
						});
						const getPastYears = this.getPastYears(parameters);
						response = {
							group: options[i].group,
							data: getPastYears
						};
						res = [...res, response];

						break;
					case 'GTMO':
						options[i].params.map((param) => {
							parameters[param.key] = param.value;
						});
						const getMonths = this.getMonths(parameters);

						response = {
							group: !parameters.isHalfMonth ? options[i].group : 'GHMO',
							data: getMonths
						};
						res = [...res, response];

						break;
					default:
						break;
				}
			}

			return createResponse(HttpStatus.OK, '', res);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async getCommonMaster(options: any): Promise<AppResponse> {
		try {
			if (options.length === 1 && options[options.length - 1].group.toLowerCase() === 'all') {
				options = [
					{
						group: 'FUYE',
						params: [
							{
								key: 'years',
								value: 10
							}
						]
					},
					{
						group: 'YOEP',
						params: [
							{
								key: 'years',
								value: 22
							}
						]
					},
					{
						group: 'MOEP',
						params: []
					},
					{
						group: 'PAYE',
						params: [
							{
								key: 'futureYears',
								value: 0
							}
						]
					},
					{
						group: 'GTMO',
						params: [
							{
								key: 'isHalfMonth',
								value: false
							}
						]
					},
					{
						group: 'GTMO',
						params: [
							{
								key: 'isHalfMonth',
								value: true
							}
						]
					}
				];
				const data = this.commonMasterData(options);
				return createResponse(HttpStatus.OK, '', data);
			} else {
				const data = this.commonMasterData(options);
				return createResponse(HttpStatus.OK, '', data);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async getDepartments(options: any): Promise<AppResponse> {
		try {
			return await this._manageAcTxn.fetchDepartments(options);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async getLocationsData(options: any): Promise<AppResponse> {
		try {
			const res = await this._manageAcTxn.fetchLocations(options);
			const resData = res.data.map((loc) => {
				return loc.name;
			});
			return createResponse(HttpStatus.OK, '', resData);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async getUniversitiesData(options: any): Promise<AppResponse> {
		try {
			const res = await this._manageAcTxn.fetchUniversities(options);
			const resData = res.data.map((uni) => {
				return uni.name;
			});
			return createResponse(HttpStatus.OK, '', resData);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async deleteLanguage({ claims, langId }): Promise<AppResponse> {
		try {
			return this._manageAcTxn.deleteLanguage({ claims, langId });
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async getCategoryMasterData(categoryInfo: any, claims: AtPayload): Promise<AppResponse> {
		try {
			switch (categoryInfo.active) {
				case 1:
					categoryInfo.active = true;
					break;
				case 0:
					categoryInfo.active = false;
					break;
			}
			categoryInfo.pageNo = categoryInfo.pageNo ? categoryInfo.pageNo : -1;
			return await this._manageAcTxn.getCategoryMasterData(categoryInfo, claims);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async getJobRoleMasterData(category: any, claims: AtPayload): Promise<AppResponse> {
		try {
			switch (category.active) {
				case 1:
					category.active = true;
					break;
				case 0:
					category.active = false;
					break;
			}
			category.pageNo = category.pageNo ? category.pageNo : -1;
			return await this._manageAcTxn.getJobRoleMasterData(category, claims);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async getCertificationProvider(certificateInfo: any, claims: AtPayload): Promise<AppResponse> {
		try {
			switch (certificateInfo.active) {
				case 1:
					certificateInfo.active = true;
					break;
				case 0:
					certificateInfo.active = false;
					break;
			}
			certificateInfo.pageNo = certificateInfo.pageNo ? certificateInfo.pageNo : -1;
			return await this._manageAcTxn.getCertProvider(certificateInfo, claims);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async getSpecializationData(specialization: any, claims: AtPayload): Promise<AppResponse> {
		try {
			switch (specialization.active) {
				case 1:
					specialization.active = true;
					break;
				case 0:
					specialization.active = false;
					break;
			}
			specialization.pageNo = specialization.pageNo ? specialization.pageNo : -1;
			return await this._manageAcTxn.getSpecialization(specialization, claims);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	// #region DELETE JOBSEEKER PROFILE VIDEO , RESUME
	async deleteJobseekerDoc(docRefObj: any): Promise<AppResponse> {
		try {
			return this._manageAcTxn.deleteJobseekerDoc(docRefObj);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async getCertificationName(certificateInfo: any, claims: AtPayload): Promise<AppResponse> {
		try {
			switch (certificateInfo.active) {
				case 1:
					certificateInfo.active = true;
					break;
				case 0:
					certificateInfo.active = false;
					break;
			}
			certificateInfo.pageNo = certificateInfo.pageNo ? certificateInfo.pageNo : -1;
			return await this._manageAcTxn.getCertName(certificateInfo, claims);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	// #endregion DELETE JOBSEEKER PROFILE VIDEO , RESUME

	//#endregion
}
