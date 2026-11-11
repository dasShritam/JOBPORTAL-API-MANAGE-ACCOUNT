import { AbstractManageAccountDao } from '@app/database/mongo/abstract/manage-account.abstract';
import { empAccountDto } from '@app/modules/manage-account/models/employer.model';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messageFactory, messages } from '@app/shared/messages.shared';

import { HttpStatus, Inject } from '@nestjs/common';

import { Model, Types } from 'mongoose';
import { MongoConstants } from '../connection/constants.mongo';

import { EmployerRegisterDto } from '@app/modules/admin-manage-account/models/adminEmpRegister';
import { RoleType } from '@app/core/enum/role-type.enum';
import AppLogger from '@app/core/logger/app-logger';
import { addDays, convert_date_unix_ts, unix_ts_now } from '@app/core/utils/timestamp.utils';
import { CompanyInfoDto, UserId } from '@app/modules/manage-account/models/company-info.model';
import { OnlineProfile, PersonalDetailss, Presentation, ProjectDetails } from '@app/modules/manage-account/models/jobseeker-profile';
import { AtPayload } from '@app/modules/manage-account/models/jwt-payload.model';
import { ProfileEmployerModel } from '../models/profile.employer.model';
import { ProfileJobSeekerModel } from '../models/profile.jobseeker.model';
import { UserAccountModel } from '../models/security.user-account.model';

export class ManageAccountDao implements AbstractManageAccountDao {
	logger: any;
	constructor(
		@Inject(MongoConstants.EMPLOYER_PROFILE_SCHEMA) private readonly _empProfileSchema: Model<any>,
		@Inject(MongoConstants.USER_ACCOUNT_SCHEMA) private readonly _accountSchema: Model<any>,
		@Inject(MongoConstants.JOBSEEKER_PROFILE_SCHEMA) private readonly _JSProfileSchema: Model<any>,
		@Inject(MongoConstants.TEMPORARY_TOKEN_SCHEMA) private readonly _tempTokenSchema: Model<any>,
		@Inject(MongoConstants.GENERIC_SCHEMA) private readonly _masterGenericSchema: Model<any>,
		@Inject(MongoConstants.SKILL_SCHEMA) private readonly _skillSchema: Model<any>,
		@Inject(MongoConstants.COUNTRY_SCHEMA) private readonly _countrySchema: Model<any>,
		@Inject(MongoConstants.INDUSTRY_SCHEMA) private readonly _industrySchema: Model<any>,
		@Inject(MongoConstants.COMPANY_SCHEMA) private readonly _masterCompanySchema: Model<any>,
		@Inject(MongoConstants.DESIGNATION_SCHEMA) private readonly _masterDesignationSchema: Model<any>,
		@Inject(MongoConstants.DEPARTMENT_SCHEMA) private readonly _masterDepartmentsSchema: Model<any>,
		@Inject(MongoConstants.LOCATION_SCHEMA) private readonly _masterLocationSchema: Model<any>,
		@Inject(MongoConstants.INSTITUTE_SCHEMA) private readonly _masterInstituteSchema: Model<any>,
		@Inject(MongoConstants.JOB_ROLE_CATEGORY_SCHEMA) private readonly _masterRoleCategorySchema: Model<any>,
		@Inject(MongoConstants.JOB_ROLE_SCHEMA) private readonly _masterJobRoleSchema: Model<any>,
		@Inject(MongoConstants.CERT_PROVIDER_SCHEMA) private readonly _certProviderSchema: Model<any>,
		@Inject(MongoConstants.SPECIALIZATION_SCHEMA) private readonly _specializationSchema: Model<any>,
		@Inject(MongoConstants.CERT_NAME_SCHEMA) private readonly _certNameSchema: Model<any>,

		readonly _loggerSvc: AppLogger
	) {}
	async fetchCompanyNames(options: any): Promise<AppResponse> {
		try {
			let data: any;
			const pageSize = 10;
			if (options.pageno === -1) {
				data = await this._masterCompanySchema.aggregate([
					{
						$match: { name: { $regex: `^${options.search}`, $options: 'i' } }
					},
					{
						$project: {
							name: 1,
							_id: 0
						}
					}
				]);
			} else {
				data = await this._masterCompanySchema
					.aggregate([
						{
							$match: { name: { $regex: `^${options.search}`, $options: 'i' } }
						},
						{
							$project: {
								name: 1,
								_id: 0
							}
						}
					])
					.skip(pageSize * (options.pageno - 1))
					.limit(pageSize);
			}

			return createResponse(HttpStatus.OK, '', data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async fetchDesignation(options: any): Promise<AppResponse> {
		try {
			let data: any;
			const pageSize = 10;
			if (options.pageno === -1) {
				data = await this._masterDesignationSchema.aggregate([
					{
						$match: { name: { $regex: `^${options.search}`, $options: 'i' } }
					},
					{
						$project: {
							name: 1,
							_id: 0
						}
					}
				]);
			} else {
				data = await this._masterDesignationSchema
					.aggregate([
						{
							$match: { name: { $regex: `^${options.search}`, $options: 'i' } }
						},
						{
							$project: {
								name: 1,
								_id: 0
							}
						}
					])
					.skip(pageSize * (options.pageno - 1))
					.limit(pageSize);
			}

			return createResponse(HttpStatus.OK, '', data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async getGenericMaster(options: any): Promise<AppResponse> {
		try {
			const resData = await this._masterGenericSchema.aggregate([
				{
					$match: {
						$or: options
					}
				},
				{ $group: { _id: '$grp', data: { $push: { value: '$$ROOT.name', id: '$$ROOT._id' } } } },

				{ $project: { _id: 0, group: '$_id', data: 1 } }
			]);
			return createResponse(HttpStatus.OK, '', resData);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async deletePublication(publication: any): Promise<AppResponse> {
		try {
			await this._JSProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(publication.user_Id) },
				{ $pull: { publ: { _id: new Types.ObjectId(publication.publicationId.id) } } }
			);
			return createResponse(HttpStatus.OK, messages.S46);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateResumeHeaderAction(header: any): Promise<AppResponse> {
		try {
			await this._JSProfileSchema.updateOne(
				{
					user_id: new Types.ObjectId(header.user_Id)
				},
				{
					$set: {
						'cp.title': header.resumeHeader.headline
					}
				},
				{ upsert: true }
			);

			return createResponse(HttpStatus.OK, messages.S23);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.OK, messages.E2);
		}
	}

	async updateProfileSummaryAction(summary: any): Promise<AppResponse> {
		try {
			await this._JSProfileSchema.updateOne(
				{
					user_id: new Types.ObjectId(summary.user_Id)
				},
				{ $set: { 'cp.smry': summary.profileHeader.summary } },
				{ upsert: true }
			);
			return createResponse(HttpStatus.OK, messages.S22);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async getEmployerProfile(userId: any): Promise<AppResponse> {
		try {
			const empProfile = await this._empProfileSchema.aggregate([{ $match: { user_id: new Types.ObjectId(userId) } }]);
			if (empProfile.length) {
				const userAccount: any = await this._accountSchema.aggregate([{ $match: { _id: new Types.ObjectId(userId) } }]);
				const userInfo = {
					acountInfo: {
						name: userAccount[0].name,
						role: userAccount[0].role,
						phno: userAccount[0].ci.prim.ph.val,
						email: userAccount[0].ci.prim.mail.val
					}
				};
				const res = {
					...empProfile[0],
					...userInfo
				};
				return res;
			} else {
				const message = messageFactory(messages.E7, [userId]);
				return createResponse(HttpStatus.NOT_FOUND, message);
			}
		} catch (error) {
			const message = messageFactory(messages.E7, [userId]);
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.NOT_FOUND, message);
		}
	}

	async UpdateEmpAccountInfo(accinfo: empAccountDto): Promise<AppResponse> {
		try {
			await this._accountSchema.updateOne(
				{ _id: new Types.ObjectId(accinfo.userid) },
				{
					$set: {
						role: accinfo.accountDetails.role,
						'ci.prim.ph.val': accinfo.accountDetails.phno
					}
				}
			);

			return createResponse(HttpStatus.OK, messages.S32);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.NOT_FOUND, messages.E8);
		}
	}

	async updateCompanyDetails(user_id: UserId, company_info: CompanyInfoDto): Promise<AppResponse> {
		try {
			try {
				await this._empProfileSchema.updateOne(
					{ user_id: user_id },
					{
						$set: {
							'profile.ind': company_info.industry_type,
							'profile.poc.name': company_info.poc.name,
							'profile.poc.role': company_info.poc.designation,
							'profile.poc.ph.prim': company_info.poc.ph.primary,
							'profile.alias': company_info.alias,
							'profile.poc.ph.secd': company_info.poc.ph.secondary,
							'profile.hvpf': company_info.hv_profile,
							'profile.clpf': company_info.cl_profile,
							'profile.web': company_info.website,
							'profile.fax': company_info.fax,
							'profile.tan': company_info.tan,
							'profile.adr.street': company_info.adr.street,
							'profile.adr.zip': company_info.adr.zip
						}
					}
				);
				return createResponse(HttpStatus.OK, messages.S5);
			} catch {
				const message = messageFactory(messages.E7, [JSON.stringify('')]);
				return createResponse(HttpStatus.NOT_FOUND, message);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateJSProject(projectDetails: ProjectDetails): Promise<AppResponse> {
		try {
			try {
				if (!projectDetails.projectDetails._id) {
					const { title, desc, client, location, skills, designation, employment_type, team_size, edu_tag, on_site, start_ts, end_ts } =
						projectDetails.projectDetails;
					try {
						if (desc.length > 1000) {
							return createResponse(HttpStatus.BAD_REQUEST, messages.W4);
						} else if (designation && designation?.desc?.length > 1000) {
							return createResponse(HttpStatus.BAD_REQUEST, messages.W5);
						} else if (skills?.length && skills.join('').length > 500) {
							return createResponse(HttpStatus.BAD_REQUEST, messages.W7);
						}
						const added = await this._JSProfileSchema.updateOne(
							{ user_id: new Types.ObjectId(projectDetails.user_id) },
							{
								$push: {
									proj: {
										title: title,
										desc: desc,
										co: client,
										loc: location ? location : null,
										skill: skills ? [...skills] : null,
										role: {
											name: designation.name ? designation.name : null,
											desc: designation.desc ? designation.desc : null
										},
										emp_type: employment_type,
										team_size: team_size,
										on_site: on_site,
										edu_id: edu_tag ? edu_tag : null,
										start_ts: convert_date_unix_ts(start_ts),
										end_ts: end_ts ? convert_date_unix_ts(end_ts) : null
									}
								}
							}
						);

						if (added.modifiedCount) {
							this._loggerSvc.log(messages.S3, HttpStatus.OK);
							return createResponse(HttpStatus.OK, messages.S9);
						} else {
							this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
							return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
						}
					} catch (error) {
						this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
						return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
					}
				} else {
					const { title, desc, client, location, skills, designation, employment_type, team_size, edu_tag, on_site, start_ts, end_ts } =
						projectDetails.projectDetails;
					try {
						if (desc.length > 1000) {
							return createResponse(HttpStatus.BAD_REQUEST, messages.W4);
						} else if (designation && designation?.desc?.length > 1000) {
							return createResponse(HttpStatus.BAD_REQUEST, messages.W5);
						} else if (skills?.length && skills?.join('').length > 500) {
							return createResponse(HttpStatus.BAD_REQUEST, messages.W7);
						}

						const updated = await this._JSProfileSchema.updateOne(
							{ user_id: new Types.ObjectId(projectDetails.user_id) },
							{
								$set: {
									'proj.$[proj].title.': title,
									'proj.$[proj].desc': desc,
									'proj.$[proj].co': client,
									'proj.$[proj].loc': location ? location : null,
									'proj.$[proj].skill': skills ? skills : null,
									'proj.$[proj].role.name': designation.name ? designation.name : null,
									'proj.$[proj].role.desc': designation.desc ? designation.desc : null,
									'proj.$[proj].emp_type': employment_type,
									'proj.$[proj].team_size': team_size,
									'proj.$[proj].on_site': on_site,
									'proj.$[proj].edu_id': edu_tag ? edu_tag : null,
									'proj.$[proj].start_ts': convert_date_unix_ts(start_ts),
									'proj.$[proj].end_ts': end_ts ? convert_date_unix_ts(end_ts) : null
								}
							},
							{
								arrayFilters: [{ 'proj._id': new Types.ObjectId(projectDetails.projectDetails._id) }]
							}
						);
						if (updated.modifiedCount) {
							this._loggerSvc.log(messages.S3, HttpStatus.OK);
							return createResponse(HttpStatus.OK, messages.S8);
						} else {
							this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
							return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
						}
					} catch {
						this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
						return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
					}
				}
			} catch {
				this._loggerSvc.error(messages.E7, HttpStatus.NOT_FOUND);
				const message = messageFactory(messages.E7, ['']);
				return createResponse(HttpStatus.NOT_FOUND, message);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateJSOnlinePpt(pptDetails: Presentation): Promise<AppResponse> {
		try {
			try {
				if (!pptDetails.pptDetails._id) {
					if (pptDetails.pptDetails.desc.length > 1000) {
						return createResponse(HttpStatus.BAD_REQUEST, messages.W6);
					}
					const added = await this._JSProfileSchema.updateOne(
						{ user_id: new Types.ObjectId(pptDetails.user_id) },
						{
							$push: {
								ppt: {
									title: pptDetails.pptDetails.title,
									desc: pptDetails.pptDetails.desc,
									uri: pptDetails.pptDetails.uri
								}
							}
						}
					);

					if (added.modifiedCount) {
						this._loggerSvc.log(messages.S3, HttpStatus.OK);
						return createResponse(HttpStatus.OK, messages.S7);
					} else {
						this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
						return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
					}
				} else {
					if (pptDetails.pptDetails.desc.length > 1000) {
						return createResponse(HttpStatus.BAD_REQUEST, messages.W6);
					}
					const updated = await this._JSProfileSchema.updateOne(
						{ user_id: new Types.ObjectId(pptDetails.user_id) },
						{
							$set: {
								'ppt.$[ppt].title': pptDetails.pptDetails.title,
								'ppt.$[ppt].desc': pptDetails.pptDetails.desc,
								'ppt.$[ppt].uri': pptDetails.pptDetails.uri
							}
						},
						{
							arrayFilters: [{ 'ppt._id': new Types.ObjectId(pptDetails.pptDetails._id) }]
						}
					);

					if (updated.modifiedCount) {
						this._loggerSvc.log(messages.S3, HttpStatus.OK);
						return createResponse(HttpStatus.OK, messages.S6);
					} else {
						this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
						return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
					}
				}
			} catch {
				this._loggerSvc.error(messages.E7, HttpStatus.NOT_FOUND);
				const message = messageFactory(messages.E7, ['']);
				return createResponse(HttpStatus.NOT_FOUND, message);
			}
		} catch {
			this._loggerSvc.error(messages.E2, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateKeySkills(user_id: string, keySkills: string[]): Promise<AppResponse> {
		try {
			try {
				await this._JSProfileSchema.updateOne({ user_id: new Types.ObjectId(user_id) }, { $set: { 'skills.key': keySkills } });
				return createResponse(HttpStatus.OK, messages.S10);
			} catch {
				const message = messageFactory(messages.E10, [JSON.stringify('')]);
				return createResponse(HttpStatus.NOT_FOUND, message);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async jobSeekerResumeUpload(options: ProfileJobSeekerModel): Promise<any> {
		try {
			await this._JSProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(options.user_id) },
				{
					$set: {
						'cp.cv': {
							name: options.cp.cv.name,
							updated_at: unix_ts_now()
						}
					}
				}
			);

			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async jobSeekerVideoUpload(options: ProfileJobSeekerModel): Promise<any> {
		try {
			await this._JSProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(options.user_id) },
				{
					$set: {
						'profile.siv': {
							name: options.profile.siv.name,
							updated_at: unix_ts_now()
						}
					}
				}
			);

			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async jobSeekerImageUpload(options: ProfileJobSeekerModel): Promise<any> {
		try {
			await this._JSProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(options.user_id) },
				{
					$set: {
						'profile.img': {
							name: options.profile.img?.name,
							updated_at: unix_ts_now()
						}
					}
				}
			);

			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async employerLogoUpload(options: ProfileEmployerModel): Promise<any> {
		try {
			await this._empProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(options.user_id) },
				{
					$set: {
						'profile.logo': {
							name: options.profile.logo?.name,
							updated_at: unix_ts_now()
						}
					}
				}
			);

			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateJobSeekerEduDetails(educationData: any): Promise<AppResponse> {
		try {
			if (educationData.type == 'school') {
				if (educationData.educationid) {
					const found = await this._JSProfileSchema.findOne({
						user_id: new Types.ObjectId(educationData.userid),
						'edu.sch._id': new Types.ObjectId(educationData.educationid)
					});
					if (found) {
						const obj = {
							'edu.sch.$[elem].course': educationData.education,
							'edu.sch.$[elem].medium': educationData.schoolMedium,
							'edu.sch.$[elem].board': educationData.board,
							'edu.sch.$[elem].marks': educationData.totalMarks,
							'edu.sch.$[elem].yr': educationData.passingOutYear,
							'edu.sch.$[elem].eng': educationData.englishMarks ? educationData.englishMarks : null,
							'edu.sch.$[elem].math': educationData.mathsMarks ? educationData.mathsMarks : null
						};

						await this._JSProfileSchema.updateOne(
							{ user_id: new Types.ObjectId(educationData.userid), 'edu.sch._id': new Types.ObjectId(educationData.educationid) },
							{ $set: obj },
							{ arrayFilters: [{ 'elem._id': new Types.ObjectId(educationData.educationid) }] }
						);
						this._loggerSvc.log(messages.S11, HttpStatus.OK);
						return createResponse(HttpStatus.OK, messages.S11);
					} else {
						this._loggerSvc.warn(messages.W3, '', HttpStatus.PARTIAL_CONTENT);
						return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
					}
				} else {
					const found = await this._JSProfileSchema.findOne({ user_id: new Types.ObjectId(educationData.userid) });
					if (found) {
						const Addobj = {
							course: educationData.education,
							medium: educationData.schoolMedium,
							board: educationData.board,
							marks: educationData.totalMarks,
							yr: educationData.passingOutYear,
							eng: educationData.englishMarks ? educationData.englishMarks : null,
							math: educationData.mathsMarks ? educationData.mathsMarks : null
						};

						await this._JSProfileSchema.updateOne({ user_id: new Types.ObjectId(educationData.userid) }, { $push: { 'edu.sch': Addobj } });
						this._loggerSvc.log(messages.S11, HttpStatus.OK);
						return createResponse(HttpStatus.OK, messages.S11);
					} else {
						this._loggerSvc.warn(messages.W3, '', HttpStatus.PARTIAL_CONTENT);
						return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
					}
				}
			} else {
				if (educationData.educationid) {
					const found = await this._JSProfileSchema.findOne({
						user_id: new Types.ObjectId(educationData.userid),
						'edu.degree._id': new Types.ObjectId(educationData.educationid)
					});
					if (found) {
						const obj = {
							'edu.degree.$[elem].inst': educationData.universityInstitute,
							'edu.degree.$[elem].level': educationData.education,
							'edu.degree.$[elem].course': educationData.course,
							'edu.degree.$[elem].ctype': educationData.courseType ? educationData.courseType : null,
							'edu.degree.$[elem].stream': educationData.specialization,
							'edu.degree.$[elem].start_ts': educationData.courseDurationStart,
							'edu.degree.$[elem].end_ts': educationData.courseDurationEnd,
							'edu.degree.$[elem].grade': educationData.gradingSystem ? educationData.gradingSystem : null,
							'edu.degree.$[elem].marks': educationData.marks ? educationData.marks : null
						};

						await this._JSProfileSchema.updateOne(
							{ user_id: new Types.ObjectId(educationData.userid), 'edu.degree._id': new Types.ObjectId(educationData.educationid) },
							{ $set: obj },
							{ arrayFilters: [{ 'elem._id': new Types.ObjectId(educationData.educationid) }] }
						);
						this._loggerSvc.log(messages.S11, HttpStatus.OK);
						return createResponse(HttpStatus.OK, messages.S11);
					} else {
						this._loggerSvc.warn(messages.W3, '', HttpStatus.PARTIAL_CONTENT);
						return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
					}
				} else {
					const found = await this._JSProfileSchema.findOne({ user_id: new Types.ObjectId(educationData.userid) });
					if (found) {
						const Addobj = {
							inst: educationData.universityInstitute,
							level: educationData.education,
							course: educationData.course,
							stream: educationData.specialization,
							start_ts: educationData.courseDurationStart,
							ctype: educationData.courseType ? educationData.courseType : null,
							end_ts: educationData.courseDurationEnd,
							grade: educationData.gradingSystem ? educationData.gradingSystem : null,
							marks: educationData.marks ? educationData.marks : null
						};

						await this._JSProfileSchema.updateOne({ user_id: new Types.ObjectId(educationData.userid) }, { $push: { 'edu.degree': Addobj } });
						this._loggerSvc.log(messages.S11, HttpStatus.OK);
						return createResponse(HttpStatus.OK, messages.S11);
					} else {
						this._loggerSvc.warn(messages.W3, '', HttpStatus.PARTIAL_CONTENT);
						return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
					}
				}
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateJobSeekerItSkills(iTSkills: any): Promise<AppResponse> {
		try {
			if (iTSkills.iTSkills._id) {
				const found = await this._JSProfileSchema.findOne({
					user_id: new Types.ObjectId(iTSkills.userid)
				});

				if (found) {
					await this._JSProfileSchema.updateOne(
						{ user_id: new Types.ObjectId(iTSkills.userid), 'skills.it._id': new Types.ObjectId(iTSkills.iTSkills._id) },
						{
							$set: {
								'skills.it.$[skl].name': iTSkills.iTSkills.name,
								'skills.it.$[skl].ver': iTSkills.iTSkills.ver ? iTSkills.iTSkills.ver : null,
								'skills.it.$[skl].exp.mos': iTSkills.iTSkills.exp.month >= 0 ? iTSkills.iTSkills.exp.month : null,
								'skills.it.$[skl].exp.yr': iTSkills.iTSkills.exp.year >= 0 ? iTSkills.iTSkills.exp.year : null,
								'skills.it.$[skl].last_ts': iTSkills.iTSkills.last_used ? iTSkills.iTSkills.last_used : null
							}
						},
						{ arrayFilters: [{ 'skl._id': new Types.ObjectId(iTSkills.iTSkills._id) }] }
					);
					this._loggerSvc.log(messages.S12, HttpStatus.OK);
					return createResponse(HttpStatus.OK, messages.S12);
				} else {
					this._loggerSvc.warn(messages.W3, '', HttpStatus.PARTIAL_CONTENT);
					return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
				}
			} else {
				const found = await this._JSProfileSchema.findOne({ user_id: new Types.ObjectId(iTSkills.userid) });
				if (found) {
					await this._JSProfileSchema.updateOne(
						{ user_id: new Types.ObjectId(iTSkills.userid) },
						{
							$push: {
								'skills.it': {
									name: iTSkills.iTSkills.name,
									ver: iTSkills.iTSkills.ver ? iTSkills.iTSkills.ver : null,
									exp: {
										mos: iTSkills.iTSkills.exp.month >= 0 ? iTSkills.iTSkills.exp.month : null,
										yr: iTSkills.iTSkills.exp.year >= 0 ? iTSkills.iTSkills.exp.year : null
									},
									last_ts: iTSkills.iTSkills.last_used ? iTSkills.iTSkills.last_used : null,
									_id: new Types.ObjectId()
								}
							}
						}
					);
					this._loggerSvc.log(messages.S12, HttpStatus.OK);
					return createResponse(HttpStatus.OK, messages.S53);
				} else {
					this._loggerSvc.warn(messages.W3, '', HttpStatus.PARTIAL_CONTENT);
					return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
				}
			}
		} catch {
			this._loggerSvc.error(messages.E2, HttpStatus.PARTIAL_CONTENT);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async getJobSeekerDetails(id: any): Promise<AppResponse> {
		try {
			const userAcOpts = {
					_id: new Types.ObjectId(id)
				},
				userAcRes = await this.fetchUserInfo(userAcOpts);

			if (userAcRes.code !== 200) return userAcRes;
			const empProfile = await this._JSProfileSchema.aggregate([
				{ $match: { user_id: new Types.ObjectId(id) } },
				{
					$project: {
						_id: 0,
						profile: {
							name: 1,
							gender: 1,
							dob: '$profile.dob_ts',
							marital_status: '$profile.marsta',
							image: {
								name: '$profile.img.name'
							},
							intro_video: '$profile.siv',
							address: '$profile.adr',
							category: '$profile.ctgy',
							disability_type: '$profile.pwd_type',

							contact: {
								$map: {
									input: '$profile.ci',
									as: 'contact',
									in: {
										country_code: '$$contact.ccode',
										area_code: '$$contact.acode',
										phno: '$$contact.ph'
									}
								}
							},
							location: '$profile.loc'
						},
						languages: '$lang',
						skills: {
							key: '$skills.key',
							it: {
								$map: {
									input: '$skills.it',
									as: 'itskills',
									in: {
										_id: '$$itskills._id',
										name: '$$itskills.name',
										version: '$$itskills.ver',
										experience: {
											month: '$$itskills.exp.mos',
											year: '$$itskills.exp.yr'
										},
										last_used: '$$itskills.last_ts'
									}
								}
							}
						},
						employments: {
							$map: {
								input: '$emp',
								as: 'employment',
								in: {
									_id: '$$employment._id',
									company: '$$employment.co',
									join_date: '$$employment.start_ts',
									work_till: '$$employment.end_ts',
									ctc: {
										currency: '$$employment.ctc.cy',
										value: '$$employment.ctc.val'
									},
									fulltime: {
										role: '$$employment.ft.role',
										job_desc: '$$employment.ft.jd',
										skill: '$$employment.ft.skill',

										notice_period: {
											term: '$$employment.ft.np.term',
											offered_role: '$$employment.ft.np.role',
											company: '$$employment.ft.np.co',
											offered_ctc: {
												currency: '$$employment.ft.np.octc.cy',
												value: '$$employment.ft.np.octc.val'
											},
											end_ts: '$$employment.ft.np.end_ts'
										}
									},
									internship: {
										location: '$$employment.intern.loc',
										dept: '$$employment.intern.dept',
										category: '$$employment.intern.ctgy',
										role: '$$employment.intern.role',
										project: '$$employment.intern.proj'
									}
								}
							}
						},
						education: {
							schools: {
								$map: {
									input: '$edu.sch',
									as: 'school',
									in: {
										_id: '$$school._id',
										course: '$$school.course',
										medium: '$$school.medium',
										board: '$$school.board',
										eng_marks: '$$school.eng',
										math_marks: '$$school.math',
										grade: '$$school.grade',
										marks: '$$school.marks',
										completion_year: '$$school.yr'
									}
								}
							},
							degree: {
								$map: {
									input: '$edu.degree',
									as: 'deg',
									in: {
										_id: '$$deg._id',
										edu_type: '$$deg.level',
										institute: '$$deg.inst',
										course: '$$deg.course',
										course_type: '$$deg.ctype',
										stream: '$$deg.stream',
										grade: '$$deg.grade',
										marks: '$$deg.marks',
										start_year: '$$deg.start_ts',
										completion_year: '$$deg.end_ts'
									}
								}
							}
						},
						project: {
							$map: {
								input: '$proj',
								as: 'proj',
								in: {
									_id: '$$proj._id',
									title: '$$proj.title',
									desc: '$$proj.desc',
									client: '$$proj.co',
									location: '$$proj.loc',
									skill: '$$proj.skill',
									role: '$$proj.role',
									emp_type: '$$proj.emp_type',
									team_size: '$$proj.team_size',
									on_site: '$$proj.on_site',
									edu_id: '$$proj.edu_id',
									start_ts: '$$proj.start_ts',
									end_ts: '$$proj.end_ts'
								}
							}
						},
						social_profile: '$soc_net',
						online_ppt: '$ppt',
						work_sample: '$ws',
						publications: '$publ',
						patent: {
							$map: {
								input: '$patent',
								as: 'patent',
								in: {
									_id: '$$patent._id',
									app_no: '$$patent.ano',
									title: '$$patent.title',
									desc: '$$patent.desc',
									uri: '$$patent.uri',
									status: '$$patent.status',
									office: '$$patent.ofc',
									issued_ts: '$$patent.iss_ts'
								}
							}
						},
						certification: {
							$map: {
								input: '$cert',
								as: 'cert',
								in: {
									_id: '$$cert._id',
									name: '$$cert.name',
									cert_id: '$$cert.cid',
									issued_by: '$$cert.iss_by',
									year: '$$cert.yr',
									uri: '$$cert.uri',
									issued_ts: '$$cert.iss_ts',
									expire_ts: '$$cert.exp_ts'
								}
							}
						},
						career_profile: {
							fresher: '$cp.fresher',
							cv: '$cp.cv',
							headline: '$cp.title',
							summary: '$cp.smry',
							total_exp: {
								month: '$cp.exp.mos',
								year: '$cp.exp.yr',
								curr_ctc: {
									currency: '$cp.exp.cctc.cy',
									value: '$cp.exp.cctc.val'
								}
							},
							career_break: '$cp.cb',
							industry: '$cp.sect',
							dept: '$cp.dept',
							category: '$cp.ctgy',
							role: '$cp.role',
							job_type: '$cp.job_type',
							emp_type: '$cp.emp_type',
							shift: '$cp.shift',
							location: '$cp.loc',
							expected_ctc: {
								currency: '$cp.ectc.cy',
								value: '$cp.ectc.val'
							},
							more_info: '$cp.wd',
							work_permit: '$cp.wp',
							work_permitOC: '$cp.wpoc',
							avail: '$cp.avail'
						},
						updated_at: 1
					}
				}
			]);
			if (!empProfile) return createResponse(HttpStatus.BAD_REQUEST, messages.W13);

			return createResponse(HttpStatus.OK, messages.S3, { js_profile: { ...empProfile[0] }, acc_info: { ...userAcRes.data[0] } });
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updatePublication(user_id: string, publicationData: any): Promise<AppResponse> {
		const { title, uri, desc, year, month } = publicationData;

		try {
			if (!publicationData._id) {
				if (publicationData.desc.length > 500) {
					return createResponse(HttpStatus.BAD_REQUEST, messages.W4);
				}

				const added = await this._JSProfileSchema.updateOne(
					{ user_id: user_id },

					{
						$push: {
							publ: {
								title: title,
								desc: desc ? desc : '',
								uri: uri,
								publ_ts: year && month ? convert_date_unix_ts(new Date(`${year}/${month}/01`)) : null
							}
						}
					}
				);
				if (added.modifiedCount) {
					this._loggerSvc.log(messages.S3, HttpStatus.OK);
					return createResponse(HttpStatus.OK, messages.S13);
				} else {
					this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
					return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
				}
			} else {
				if (publicationData.desc.length > 500) {
					return createResponse(HttpStatus.BAD_REQUEST, messages.W9);
				}
				const update = await this._JSProfileSchema.updateOne(
					{ user_id: user_id },
					{
						$set: {
							'publ.$[publ].title': title,
							'publ.$[publ].desc': desc,
							'publ.$[publ].uri': uri,
							'publ.$[publ].publ_ts': year && month ? convert_date_unix_ts(new Date(`${year}/${month}/01`)) : null
						}
					},
					{
						arrayFilters: [{ 'publ._id': publicationData._id }]
					}
				);
				if (update.modifiedCount) {
					// this._loggerSvc.log(messages.S3,HttpStatus.OK)
					return createResponse(HttpStatus.OK, messages.S14);
				} else {
					// this._loggerSvc.warn(messages.W3,`${HttpStatus.PARTIAL_CONTENT}`)
					return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W9);
				}
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			const message = messageFactory(messages.E7, [user_id]);
			return createResponse(HttpStatus.NOT_FOUND, message);
		}
	}

	//#region JobSeekerPatent

	async updatePatent(patentinfo: any): Promise<AppResponse> {
		if (patentinfo.patentid) {
			try {
				const found = await this._JSProfileSchema.findOne({
					user_id: new Types.ObjectId(patentinfo.user_Id),
					'patent._id': new Types.ObjectId(patentinfo.patentid)
				});

				if (found) {
					await this._JSProfileSchema.updateOne(
						{ user_id: new Types.ObjectId(patentinfo.user_Id), 'patent._id': new Types.ObjectId(patentinfo.patentid) },
						{
							$set: {
								'patent.$[pat].title': patentinfo.title,
								'patent.$[pat].uri': patentinfo.uri,
								'patent.$[pat].ano': patentinfo.app_no ? patentinfo.app_no : null,
								'patent.$[pat].desc': patentinfo.desc ? patentinfo.desc : null,
								'patent.$[pat].status': patentinfo.status ? patentinfo.status : null,
								'patent.$[pat].ofc': patentinfo.ofc ? patentinfo.ofc : null,
								'patent.$[pat].iss_ts': patentinfo.issued_ts ? patentinfo.issued_ts : null
							}
						},
						{ arrayFilters: [{ 'pat._id': new Types.ObjectId(patentinfo.patentid) }] }
					);
					this._loggerSvc.log(messages.S16, HttpStatus.OK);
					return createResponse(HttpStatus.OK, messages.S16);
				} else {
					this._loggerSvc.warn(messages.W3, '', HttpStatus.PARTIAL_CONTENT);
					return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
				}
			} catch {
				this._loggerSvc.error(messages.E2, HttpStatus.PARTIAL_CONTENT);
				return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			}
		} else {
			try {
				const found = await this._JSProfileSchema.findOne({ user_id: new Types.ObjectId(patentinfo.user_Id) });
				if (found) {
					await this._JSProfileSchema.updateOne(
						{ user_id: new Types.ObjectId(patentinfo.user_Id) },
						{
							$push: {
								patent: {
									title: patentinfo.title,
									uri: patentinfo.uri,
									ano: patentinfo.app_no ? patentinfo.app_no : null,
									desc: patentinfo.desc ? patentinfo.desc : null,
									status: patentinfo.status ? patentinfo.status : null,
									ofc: patentinfo.ofc ? patentinfo.ofc : null,
									iss_ts: patentinfo.issued_ts ? patentinfo.issued_ts : null
								}
							}
						}
					);
					this._loggerSvc.log(messages.S15, HttpStatus.OK);
					return createResponse(HttpStatus.OK, messages.S15);
				} else {
					this._loggerSvc.warn(messages.W3, '', HttpStatus.PARTIAL_CONTENT);
					return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
				}
			} catch {
				this._loggerSvc.error(messages.E2, HttpStatus.PARTIAL_CONTENT);
				return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			}
		}
	}

	//endregion

	async updateJobseekerCareer(careerValues: any): Promise<AppResponse> {
		try {
			const added = await this._JSProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(careerValues.userid) },
				{
					$set: {
						'cp.sect': careerValues.careerDetails.currentIndustry,
						'cp.dept': careerValues.careerDetails.department,
						'cp.ctgy': careerValues.careerDetails.roleCategory,
						'cp.role': careerValues.careerDetails.jobRole,
						'cp.job_type': careerValues.careerDetails.jobTypecheckbox,
						'cp.emp_type': careerValues.careerDetails.empTypecheckbox,
						'cp.shift': careerValues.careerDetails.preferedShift,
						'cp.ectc': {
							cy: careerValues.careerDetails.exp_ctc.currency,
							val: careerValues.careerDetails.exp_ctc.val
						},
						'cp.loc': careerValues.careerDetails.preferedLocation
					}
				},
				{ upsert: true }
			);

			if (added.modifiedCount) {
				return createResponse(HttpStatus.OK, messages.S27);
			} else {
				return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			const message = messageFactory(messages.E7, ['']);
			return createResponse(HttpStatus.NOT_FOUND, message);
		}
	}

	async patchCertificate(certificate: any): Promise<any> {
		try {
			const { name, issued_by, _id, certificate_id, uri, fromMonth, fromYear, toMonth, toYear } = certificate.certificateDetails;
			const issued_ts = convert_date_unix_ts(new Date(`${fromYear}/${fromMonth}/01`));
			const expiry_ts = convert_date_unix_ts(new Date(`${toYear}/${toMonth}/01`));

			if (_id) {
				await this._JSProfileSchema.updateOne(
					{
						user_id: new Types.ObjectId(certificate.user_id),
						'cert._id': new Types.ObjectId(_id),
						cert: {
							$elemMatch: { _id: new Types.ObjectId(_id) }
						}
					},
					{
						$set: {
							'cert.$.name': name,
							'cert.$.iss_by': issued_by,
							'cert.$.cid': certificate_id ? certificate_id : null,
							'cert.$.uri': uri ? uri : null,
							'cert.$.iss_ts': fromYear && fromMonth ? issued_ts : null,
							'cert.$.exp_ts': toYear && toMonth ? expiry_ts : null
						}
					},
					{
						arrayFilters: [{ 'cert._id': certificate_id }]
					}
				);

				this._loggerSvc.log(messages.S19, HttpStatus.OK);
				return createResponse(HttpStatus.OK, messages.S19);
			} else {
				await this._JSProfileSchema.updateOne(
					{ user_id: new Types.ObjectId(certificate.user_id) },
					{
						$push: {
							cert: {
								name: name,
								iss_by: issued_by,
								cid: certificate_id ? certificate_id : null,
								uri: uri ? uri : null,
								iss_ts: fromYear && fromMonth ? issued_ts : null,
								exp_ts: toYear && toMonth ? expiry_ts : null
							}
						}
					}
				);
				this._loggerSvc.log(messages.S20, HttpStatus.OK);
				return createResponse(HttpStatus.OK, messages.S20);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateJobSeekerPersonalDetails(PersonalDetails: PersonalDetailss): Promise<AppResponse> {
		try {
			const { gender, dob_ts, more_info, disability_type, marital_status, work_permit, work_permitOC, category, career_break, languages, addresses } =
				PersonalDetails.personaldetails;
			let from_ts;
			let till_ts;

			if (career_break.duration.from_ts.startYear && career_break.duration.from_ts.startMonth + 1) {
				from_ts = convert_date_unix_ts(
					new Date(`${career_break.duration.from_ts.startYear}/${Number(career_break.duration.from_ts.startMonth) + 1}/01`)
				);
				till_ts = career_break.duration.till_ts.endYear
					? convert_date_unix_ts(new Date(`${career_break.duration.till_ts.endYear}/${Number(career_break.duration.till_ts.endMonth) + 1}/01`))
					: 0;
			} else {
				from_ts = 0;
				till_ts = 0;
			}

			const month = Number(dob_ts.month) + 1;
			const dob = convert_date_unix_ts(new Date(`${dob_ts.year},${month},${dob_ts.day}`));

			const carrerObj = {
				reason: career_break.reason ? career_break.reason : null,
				from_ts: from_ts !== 0 ? from_ts : null,
				till_ts: till_ts !== 0 ? till_ts : null
			};

			await this._JSProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(PersonalDetails.user_id) },
				{
					$set: {
						'profile.dob_ts': dob ? dob : null,
						'profile.gender': gender ? gender : null,
						'profile.marsta': marital_status ? marital_status : null,
						'profile.ctgy': category ? category : null,
						'cp.cb': { ...carrerObj } ? { ...carrerObj } : null,
						lang: [...languages],
						'profile.adr': addresses ? addresses : null,
						'cp.wp': work_permit ? work_permit : null,
						'cp.wpoc': work_permitOC ? work_permitOC : null,
						'cp.wd': more_info ? more_info : null,
						'profile.pwd_type': disability_type ? disability_type : null
					}
				},
				{
					upsert: true
				}
			);

			this._loggerSvc.log(messages.S21, HttpStatus.OK);
			return createResponse(HttpStatus.OK, messages.S21);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async jobSeekerSelfRegister(jsDetails: any, ip: string, tempToken: string, days: string): Promise<AppResponse> {
		//Admin JS reg
		try {
			const _id = jsDetails.createdBy;
			await this._accountSchema.create({
				_id: jsDetails._id,
				uname: jsDetails.email,
				name: jsDetails.fullName,
				'ci.prim.ph': {
					code: jsDetails.country_code,
					val: jsDetails.phno,
					iv: false
				},
				'ci.prim.mail': {
					val: jsDetails.email,
					iv: false
				},
				role: RoleType.JOBSEEKER,
				reg_mode: 'Credentials',

				login_enabled: jsDetails.access,
				active: false,
				created_by: _id,
				created_at: unix_ts_now(),
				updated_at: unix_ts_now()
			});

			await this._JSProfileSchema.create({
				user_id: jsDetails._id,
				profile: {
					name: jsDetails.fullName,
					dob_ts: convert_date_unix_ts(jsDetails.dateofbirth),
					ci: [
						{
							ccode: jsDetails.country_code,
							acode: '',
							ph: jsDetails.phno
						}
					],
					loc: {
						city: jsDetails.currentcity,
						state: '',
						country: jsDetails.currentcountry
					}
				},
				'cp.fresher': jsDetails.fresher,
				lang: [],
				'cp.cv': {
					name: jsDetails.resumeName,
					updated_at: unix_ts_now()
				},
				created_at: unix_ts_now(),
				updated_at: unix_ts_now()
			});
			if (jsDetails?.access) {
				const setDate = addDays(Number(days)),
					expieryDate = convert_date_unix_ts(setDate);
				const responce = await this._tempTokenSchema.create({
					token: tempToken,
					user_id: new Types.ObjectId(jsDetails._id),
					data: RoleType.JOBSEEKER,
					ip: ip,
					exp_ts: expieryDate
				});
				// if (responce.length) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
				return createResponse(HttpStatus.OK, messages.S26, responce.acctActivationCode);
			}
			return createResponse(HttpStatus.OK, messages.S26);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateWorkSample(user_id: string, data: any): Promise<AppResponse> {
		const { title, DurationFrom, DurationTo, DurationTomonth, DurationFrommonth, desc, uri } = data;
		try {
			if (!data._id) {
				const added = await this._JSProfileSchema.updateOne(
					{ user_id: user_id },

					{
						$push: {
							ws: {
								title: title,
								desc: desc,
								uri: uri ? uri : '',
								start_ts: DurationFrom && DurationFrommonth ? convert_date_unix_ts(new Date(`${DurationFrom}/${DurationFrommonth}/01`)) : null,
								end_ts:
									DurationFrom && DurationFrommonth && DurationTo && DurationTomonth
										? convert_date_unix_ts(new Date(`${DurationTo}/${DurationTomonth}/01`))
										: null
							}
						}
					}
				);
				if (added.modifiedCount) {
					this._loggerSvc.log(messages.S3, HttpStatus.OK);
					return createResponse(HttpStatus.OK, messages.S24);
				} else {
					this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
					return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
				}
			} else {
				const update = await this._JSProfileSchema.updateOne(
					{ user_id: user_id },
					{
						$set: {
							'ws.$[ws].title': title,
							'ws.$[ws].desc': desc,
							'ws.$[ws].uri': uri,
							'ws.$[ws].start_ts':
								DurationFrom && DurationFrommonth ? convert_date_unix_ts(new Date(`${DurationFrom}/${DurationFrommonth}/01`)) : null,
							'ws.$[ws].end_ts': DurationTo && DurationTomonth ? convert_date_unix_ts(new Date(`${DurationTo}/${DurationTomonth}/01`)) : null
						}
					},
					{
						arrayFilters: [{ 'ws._id': data._id }]
					}
				);
				if (update.modifiedCount) {
					this._loggerSvc.log(messages.S3, HttpStatus.OK);
					return createResponse(HttpStatus.OK, messages.S25);
				} else {
					this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
					return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
				}
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			const message = messageFactory(messages.E7, [user_id]);
			return createResponse(HttpStatus.NOT_FOUND, message);
		}
	}

	async updateJobSeekerBasicDetails(data: any): Promise<AppResponse> {
		try {
			const { user_id } = data;

			const loc = {
				city: data.careerDetails.curr_location.city,
				state: data?.careerDetails?.curr_location.state,
				country: data.careerDetails.curr_location.country
			};
			const contact = {
				_id: false,
				ccode: data?.careerDetails.contacts.country_code,
				acode: data?.careerDetails.contacts.area_code,
				ph: data?.careerDetails.contacts.phno
			};

			const phone = await this._accountSchema.findOne({ _id: new Types.ObjectId(user_id) }, { ci: 1 });

			if (phone && phone.ci.prim.ph.val !== data.careerDetails?.phno) {
				const res = await this._accountSchema.exists({ 'ci.prim.ph.val': data?.careerDetails?.phno });
				if (res) {
					return createResponse(HttpStatus.BAD_REQUEST, messages.W20);
				}
				await this._accountSchema.updateOne(
					{ _id: new Types.ObjectId(user_id) },
					{
						$set: {
							'ci.prim.ph.val': data.careerDetails?.phno,
							'ci.prim.ph.code': data.careerDetails?.code,
							'ci.prim.ph.iv': false
						}
					}
				);
			} else if (phone && phone.ci.prim.ph.code !== data.careerDetails?.code && !phone.ci.prim.iv) {
				await this._accountSchema.updateOne(
					{ _id: new Types.ObjectId(user_id) },
					{
						$set: {
							'ci.prim.ph.code': data.careerDetails?.code
						}
					}
				);
			}

			//useraccount
			await this._accountSchema.updateOne(
				{ _id: new Types.ObjectId(user_id) },
				{
					$set: {
						name: data?.careerDetails?.name
					}
				}
			);
			if (data?.careerDetails?.expId) {
				const userDetailsAdded = await this._JSProfileSchema.updateOne(
					{ user_id: new Types.ObjectId(user_id) },

					{
						$set: {
							'cp.exp.mos': data?.careerDetails?.experience.month >= 0 ? data?.careerDetails?.experience.month : null,
							'cp.exp.yr': data?.careerDetails?.experience.year >= 0 ? data?.careerDetails?.experience.year : null,
							'profile.name': data?.careerDetails?.name,
							'cp.fresher': data?.careerDetails?.fresher,
							'profile.ci': contact,
							'profile.loc.city': loc.city,
							'profile.loc.country': loc.country,
							'cp.exp.cctc.cy': data?.careerDetails?.experience.currency ? data?.careerDetails?.experience.currency : null,
							'cp.exp.cctc.val': data?.careerDetails?.experience.curr_ctc ? data?.careerDetails?.experience.curr_ctc : null,
							'emp.$[elem].ft.np.term': data?.careerDetails?.notice_period.term || null,
							'emp.$[elem].ft.np.end_ts': data?.careerDetails?.notice_period.end_ts
								? convert_date_unix_ts(data?.careerDetails?.notice_period.end_ts)
								: null,
							'emp.$[elem].ctc.cy': data?.careerDetails?.experience.currency ? data?.careerDetails?.experience.currency : null,
							'emp.$[elem].ctc.val': data?.careerDetails?.experience.curr_ctc ? data?.careerDetails?.experience.curr_ctc : null
						}
					},
					{ arrayFilters: [{ 'elem._id': new Types.ObjectId(data?.careerDetails?.expId), 'elem.end_ts': null }] }
				);
				if (userDetailsAdded.modifiedCount) {
					return createResponse(HttpStatus.OK, messages.S28);
				}
			} else {
				const updateDetails = await this._JSProfileSchema.updateOne(
					{ user_id: new Types.ObjectId(user_id) },
					{
						$set: {
							'cp.exp.mos': data?.careerDetails?.experience.month >= 0 ? data?.careerDetails?.experience.month : null,
							'cp.exp.yr': data?.careerDetails?.experience.year >= 0 ? data?.careerDetails?.experience.year : null,
							'profile.name': data?.careerDetails?.name,
							'cp.fresher': data?.careerDetails?.fresher,
							'profile.ci': contact,
							'profile.loc': { ...loc },
							'cp.avail': data?.careerDetails?.join_after ? data?.careerDetails?.join_after : null,
							'cp.exp.cctc.cy': data?.careerDetails?.experience.currency ? data?.careerDetails?.experience.currency : null,
							'cp.exp.cctc.val': data?.careerDetails?.experience.curr_ctc ? data?.careerDetails?.experience.curr_ctc : null
						}
					}
				);
				if (updateDetails.modifiedCount) {
					return createResponse(HttpStatus.OK, messages.S28);
				}
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#region employement
	async updateJobseekerEmployement(employement: any): Promise<AppResponse> {
		try {
			const found = await this._JSProfileSchema.findOne({ user_id: new Types.ObjectId(employement.user_id) });

			if (found) {
				if (!employement.end_ts && employement.fullTime) {
					await this._JSProfileSchema.updateOne(
						{ user_id: new Types.ObjectId(employement.user_id) },
						{
							$set: {
								'cp.exp.cctc.cy': employement.experience.currency,
								'cp.exp.cctc.val': employement.experience.curr_ctc
							}
						}
					);
					await this._JSProfileSchema.updateMany(
						{
							user_id: new Types.ObjectId(employement.user_id),
							emp: {
								$elemMatch: {
									end_ts: null
								}
							}
						},
						{ $set: { 'emp.$[emp].end_ts': convert_date_unix_ts(new Date()) } },
						{ arrayFilters: [{ 'emp.end_ts': null }] }
					);

					// await this._JSProfileSchema.updateMany(
					// 	{ user_id: new Types.ObjectId(employement.user_id), 'employments.is_current': true,'employments.emp_type':"FullTime"},
					// 	{ $set: { 'employments.$[].is_current': false } }
					// );
				}
				const commonProp = {
					'emp.$[emp].co': employement.org,
					'emp.$[emp].start_ts': employement.start_ts,
					'emp.$[emp].end_ts': employement.end_ts ? employement.end_ts : null,
					'emp.$[emp].ctc.cy': employement.experience.currency ? employement.experience.currency : null,
					'emp.$[emp].ctc.val': employement.experience.curr_ctc ? employement.experience.curr_ctc : null
				};
				if (employement.employement_id) {
					const foundempl = await this._JSProfileSchema.findOne({
						user_id: new Types.ObjectId(employement.user_id),
						'emp._id': new Types.ObjectId(employement.employement_id)
					});

					// if (employement.is_current == true) {
					// 	await this._JSProfileSchema.update(
					// 		{ user_id: new Types.ObjectId(employement.user_id), 'employments.is_current': true },
					// 		{ $set: { 'employments.$.is_current': false } }
					// 	);
					// }
					if (foundempl) {
						let updated: any;
						if (employement.fullTime) {
							updated = await this._JSProfileSchema.updateOne(
								{
									user_id: new Types.ObjectId(employement.user_id),
									'emp._id': new Types.ObjectId(employement.employement_id)
								},
								{
									$set: {
										...commonProp,
										'emp.$[emp].ft.role': employement.fullTime.role,
										'emp.$[emp].ft.jd': employement.fullTime.job_desc ? employement.fullTime.job_desc : null,
										'emp.$[emp].ft.skill': employement.fullTime.skills ? employement.fullTime.skills : null,
										'emp.$[emp].ft.np.term': employement.fullTime.noticePeriod.term ? employement.fullTime.noticePeriod.term : null,
										'emp.$[emp].ft.np.role': employement.fullTime.noticePeriod.offered_role ? employement.fullTime.noticePeriod.offered_role : null,
										'emp.$[emp].ft.np.co': employement.fullTime.noticePeriod.company ? employement.fullTime.noticePeriod.company : null,
										'emp.$[emp].ft.np.octc.cy': employement.fullTime.noticePeriod.offer_salary.currency,
										'emp.$[emp].ft.np.octc.val': employement.fullTime.noticePeriod.offer_salary.ctc,
										'emp.$[emp].ft.np.end_ts': employement.notice_end_ts ? employement.notice_end_ts : null
									}
								},
								{
									arrayFilters: [{ 'emp._id': new Types.ObjectId(employement.employement_id) }]
								}
							);
						}
						if (employement.internship) {
							updated = await this._JSProfileSchema.updateOne(
								{
									user_id: new Types.ObjectId(employement.user_id),
									'emp._id': new Types.ObjectId(employement.employement_id)
								},
								{
									$set: {
										...commonProp,
										'emp.$[emp].ft': {},
										'emp.$[emp].intern.loc': employement.internship.location,
										'emp.$[emp].intern.dept': employement.internship.dept,
										'emp.$[emp].intern.ctgy': employement.internship.category,
										'emp.$[emp].intern.role': employement.internship.role,
										'emp.$[emp].intern.proj.desc': employement.internship.proj.desc ? employement.internship.proj.desc : null,
										'emp.$[emp].intern.proj.uri': employement.internship.proj.uri ? employement.internship.proj.uri : null
									}
								},
								{
									arrayFilters: [{ 'emp._id': new Types.ObjectId(employement.employement_id) }]
								}
							);
						}
						if (!employement.end_year && (employement.expYear || employement.expYear == 0) && (employement.expMonth || employement.expMonth == 0)) {
							const jsProfileInfo = await this._JSProfileSchema.aggregate([
								{
									$match: {
										user_id: new Types.ObjectId(employement.user_id)
									}
								},
								{
									$project: {
										cp: 1
									}
								}
							]);

							if (jsProfileInfo) {
								await this._JSProfileSchema.updateOne(
									{ user_id: new Types.ObjectId(employement.user_id) },
									{
										$set: {
											'cp.fresher': false,
											'cp.exp.mos': employement.expMonth,
											'cp.exp.yr': employement.expYear
										}
									}
								);
							}
						}
						if (updated) {
							this._loggerSvc.log(messages.S35, HttpStatus.OK);
							return createResponse(HttpStatus.OK, messages.S35);
						}
					} else {
						this._loggerSvc.warn(messages.W3, '', HttpStatus.PARTIAL_CONTENT);
						return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
					}
				} else {
					const commonProp = {
						co: employement.org,
						start_ts: employement.start_ts,
						end_ts: employement.end_ts ? employement.end_ts : null,
						ctc: {
							cy: employement.experience.currency ? employement.experience.currency : null,
							val: employement.experience.curr_ctc ? employement.experience.curr_ctc : null
						}
					};

					let added: any;
					if (employement.fullTime) {
						added = await this._JSProfileSchema.updateOne(
							{ user_id: new Types.ObjectId(employement.user_id) },
							{
								$push: {
									emp: {
										...commonProp,
										ft: {
											role: employement.fullTime.role,
											jd: employement.fullTime.job_desc ? employement.fullTime.job_desc : null,
											skill: employement.fullTime.skills ? employement.fullTime.skills : null,
											np: {
												term: employement.fullTime.noticePeriod.term ? employement.fullTime.noticePeriod.term : null,
												role: employement.fullTime.noticePeriod.offered_role ? employement.fullTime.noticePeriod.offered_role : null,
												co: employement.fullTime.noticePeriod.company ? employement.fullTime.noticePeriod.company : null,
												octc: {
													cy: employement.fullTime.noticePeriod.offer_salary.currency,
													val: employement.fullTime.noticePeriod.offer_salary.ctc
												},
												end_ts: employement.notice_end_ts ? employement.notice_end_ts : null
											}
										}
									}
								}
							}
						);
					}
					if (employement.internship) {
						added = await this._JSProfileSchema.updateOne(
							{ user_id: new Types.ObjectId(employement.user_id) },
							{
								$push: {
									emp: {
										...commonProp,
										ft: undefined,
										intern: {
											loc: employement.internship.location,
											dept: employement.internship.dept,
											ctgy: employement.internship.category,
											role: employement.internship.role,
											proj: {
												desc: employement.internship.proj.desc ? employement.internship.proj.desc : null,
												uri: employement.internship.proj.uri ? employement.internship.proj.uri : null
											}
										}
									}
								}
							}
						);
					}
					if (added) {
						this._loggerSvc.log(messages.S34, HttpStatus.OK);
						return createResponse(HttpStatus.OK, messages.S34);
					}
				}
			} else {
				this._loggerSvc.warn(messages.E8, '', HttpStatus.PARTIAL_CONTENT);
				return createResponse(HttpStatus.PARTIAL_CONTENT, messages.E8);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.PARTIAL_CONTENT);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
	async updateJSOnlineProfile(profileDetails: OnlineProfile): Promise<AppResponse> {
		try {
			try {
				if (!profileDetails.profileDetails._id) {
					if (profileDetails.profileDetails.desc.length > 1000) {
						return createResponse(HttpStatus.BAD_REQUEST, messages.W9);
					}
					const added = await this._JSProfileSchema.updateOne(
						{ user_id: new Types.ObjectId(profileDetails.user_id) },
						{
							$push: {
								soc_net: {
									name: profileDetails.profileDetails.name,
									desc: profileDetails.profileDetails.desc,
									uri: profileDetails.profileDetails.uri
								}
							}
						}
					);

					if (added.modifiedCount) {
						this._loggerSvc.log(messages.S3, HttpStatus.OK);
						return createResponse(HttpStatus.OK, messages.S30);
					} else {
						this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
						return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
					}
				} else {
					if (profileDetails.profileDetails.desc.length > 1000) {
						return createResponse(HttpStatus.BAD_REQUEST, messages.W9);
					}
					const updated = await this._JSProfileSchema.updateOne(
						{ user_id: new Types.ObjectId(profileDetails.user_id) },
						{
							$set: {
								'soc_net.$[soc_net].name': profileDetails.profileDetails.name,
								'soc_net.$[soc_net].desc': profileDetails.profileDetails.desc,
								'soc_net.$[soc_net].uri': profileDetails.profileDetails.uri
							}
						},
						{
							arrayFilters: [{ 'soc_net._id': new Types.ObjectId(profileDetails.profileDetails._id) }]
						}
					);
					if (updated.modifiedCount) {
						this._loggerSvc.log(messages.S3, HttpStatus.OK);
						return createResponse(HttpStatus.OK, messages.S31);
					} else {
						this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
						return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
					}
				}
			} catch (error) {
				this._loggerSvc.error(messages.E7, HttpStatus.NOT_FOUND);
				const message = messageFactory(messages.E7, ['']);
				return createResponse(HttpStatus.NOT_FOUND, message);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	/*Fetch jobseeker profile info*/
	async fetchJobseekerInfo(options: ProfileJobSeekerModel): Promise<AppResponse> {
		try {
			const jsProfile = await this._JSProfileSchema.aggregate([
				{
					$match: {
						user_id: options.user_id
					}
				},
				{
					$project: {
						_id: 0,
						user_id: 1,
						headline: '$cp.title',
						name: '$profile.name',
						gender: '$profile.gender',
						intro_video: '$profile.siv.name',
						cv: '$cp.cv.name',
						it: '$skills.it',
						schools: '$edu.sch',
						degree: '$edu.degree',
						edu: 1,
						profile: 1
					}
				}
			]);
			if (!jsProfile.length) return createResponse(HttpStatus.BAD_REQUEST, messages.W13);
			return createResponse(HttpStatus.OK, messages.S3, jsProfile);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	/*Fetch Employer profile info*/
	async fetchEmployerInfo(options: ProfileEmployerModel): Promise<AppResponse> {
		try {
			const empProfile = await this._empProfileSchema.aggregate([
				{
					$match: {
						user_id: options.user_id
					}
				},
				{
					$project: {
						_id: 0,
						user_id: 1,
						name: '$profile.name',
						profile: 1
					}
				}
			]);
			if (!empProfile.length) return createResponse(HttpStatus.BAD_REQUEST, messages.W13);
			return createResponse(HttpStatus.OK, messages.S3, empProfile);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	/*Fetch user account information*/
	async fetchUserInfo(options: UserAccountModel): Promise<AppResponse> {
		try {
			const acInfo = await this._accountSchema.aggregate([
				{
					$match: { _id: options._id }
				},
				{
					$project: {
						_id: 0,
						user_id: '$_id',
						uname: 1,
						name: 1,
						ph_verified: '$ci.prim.ph.iv',
						email_verified: '$ci.prim.mail.iv',
						contact: {
							primary: {
								code: '$ci.prim.ph.code',
								phno: '$ci.prim.ph.val',
								email: '$ci.prim.mail.val'
							}
						}
					}
				}
			]);
			if (!acInfo) return createResponse(HttpStatus.BAD_REQUEST, messages.W13);
			return createResponse(HttpStatus.OK, messages.S3, acInfo);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	/* Region start fetch report*/

	async fetchEmpJsReport(): Promise<AppResponse> {
		try {
			const countJSActive = await this._accountSchema.find({ role: 'JOBSEEKER', active: true }).count();
			const countJSNonActive = await this._accountSchema.find({ role: 'JOBSEEKER', active: false }).count();
			const countEmployerActive = await this._accountSchema.find({ role: 'EMPLOYER', active: true }).count();
			const countEmployerNonActive = await this._accountSchema.find({ role: 'EMPLOYER', active: false }).count();
			const displayCount = {
				JobSeeker_Active_Status: countJSActive,
				JobSeeker_NonActive_Status: countJSNonActive,
				Employer_Active_Status: countEmployerActive,
				Employer_NonActive_Status: countEmployerNonActive
			};

			return createResponse(HttpStatus.OK, 'success', displayCount);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async fetchEmpJsDetails(claims: any): Promise<AppResponse> {
		try {
			let activedata: any;
			if ((claims.active, claims.role)) {
				activedata = await this._accountSchema.aggregate([
					{
						$match: {
							active: claims.active,
							role: claims.role
						}
					},
					{
						$project: {
							_id: 0,
							role: 1,
							uname: 1,
							name: 1,
							login_enabled: 1,
							active: 1
						}
					}
				]);
			} else {
				activedata = await this._accountSchema.aggregate([
					{
						$project: {
							_id: 0,
							role: 1,
							uname: 1,
							name: 1,
							login_enabled: 1,
							active: 1
						}
					}
				]);
			}
			return createResponse(HttpStatus.OK, 'EmpJsStatusDetails', activedata);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	/*end region*/

	//#region Auth Emp Register
	async getMail(mail: string): Promise<AppResponse> {
		try {
			const isMail = await this._accountSchema.find({ uname: mail }, { uname: 1 });
			if (isMail.length) return createResponse(HttpStatus.FOUND, messages.W16);
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//Admin employer register
	async postEmpRegister(empRegDetails: EmployerRegisterDto, ip: string, tempToken: string, admin_id: string, days: string): Promise<AppResponse> {
		try {
			const setDate = addDays(Number(days)),
				expieryDate = convert_date_unix_ts(setDate),
				time = await unix_ts_now(),
				id = new Types.ObjectId();
			const result1 = await this._empProfileSchema.create({
				user_id: id,
				profile: {
					name: empRegDetails.empCompany,
					type: empRegDetails.empType,
					poc: {
						name: empRegDetails.empName,
						role: empRegDetails.empDesignation,
						ph: {
							prim: `${empRegDetails.empPhoneCode}${empRegDetails.empPhoneNo}`
						}
					},
					adr: {
						street: empRegDetails.empAddress,
						zip: empRegDetails.empPin
					}
				},

				created_at: unix_ts_now()
			});
			if (!result1) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			const result2 = await this._accountSchema.create({
				_id: id,
				uname: empRegDetails.empMail,
				name: empRegDetails.empName,
				'ci.prim.ph': {
					code: empRegDetails.empPhoneCode,
					val: empRegDetails.empPhoneNo,
					iv: false
				},
				role: RoleType.EMPLOYER,
				reg_mode: 'Credentials',
				'ci.prim.mail.iv': false,
				login_enabled: empRegDetails.empAccess,
				active: false,
				created_by: new Types.ObjectId(admin_id),
				created_at: time
			});
			if (!result2) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			if (empRegDetails.empAccess) {
				const responce = await this._tempTokenSchema.create({
					token: tempToken,
					user_id: new Types.ObjectId(result2.id),
					ip: ip,
					exp_ts: expieryDate
				});
				if (responce.length) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
				return createResponse(HttpStatus.OK, messages.S3, responce.acctActivationCode);
			}
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region delete employemnt
	async deleteEmployement(delEmployement: any): Promise<AppResponse> {
		try {
			const foundempl = await this._JSProfileSchema.aggregate([
				{ $match: { user_id: new Types.ObjectId(delEmployement.userid) } },
				{ $unwind: '$emp' },
				{ $match: { 'emp._id': new Types.ObjectId(delEmployement.employementid) } },
				{ $project: { emp: 1 } }
			]);

			if (foundempl) {
				await this._JSProfileSchema.updateOne(
					{ user_id: new Types.ObjectId(delEmployement.userid) },
					{ $pull: { emp: { _id: new Types.ObjectId(delEmployement.employementid) } } }
				);
				return createResponse(HttpStatus.OK, messages.S40);
			} else {
				this._loggerSvc.warn(messages.W3, '', HttpStatus.PARTIAL_CONTENT);
				return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#endregion

	async deletePresentation(presentationObj: any): Promise<AppResponse> {
		try {
			await this._JSProfileSchema.findOne(
				{ user_id: new Types.ObjectId(presentationObj.claims.sub) },
				{ ppt: { $elemMatch: { _id: new Types.ObjectId(presentationObj.presentationId) } } }
			);

			const deleteOne = await this._JSProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(presentationObj.claims.sub) },
				{ $pull: { ppt: { _id: new Types.ObjectId(presentationObj.presentationId) } } }
			);

			if (deleteOne.modifiedCount) {
				this._loggerSvc.log(messages.S39, HttpStatus.OK);
				return createResponse(HttpStatus.OK, messages.S39);
			} else {
				this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
				return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async deleteOnlineProfile(onlineProfileId: any): Promise<AppResponse> {
		try {
			await this._JSProfileSchema.find(
				{ user_id: new Types.ObjectId(onlineProfileId.user_Id) },
				{ soc_net: { $elemMatch: { _id: new Types.ObjectId(onlineProfileId.OnlineProfileId.id) } } }
			);

			await this._JSProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(onlineProfileId.user_Id) },
				{ $pull: { soc_net: { _id: new Types.ObjectId(onlineProfileId.OnlineProfileId.id) } } }
			);
			return createResponse(HttpStatus.OK, messages.S45);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	/*start deletePatent */
	async deletePatent(patent: any): Promise<AppResponse> {
		try {
			await this._JSProfileSchema.findOne({
				user_id: new Types.ObjectId(patent.user_Id),
				'patent._id': new Types.ObjectId(patent.patentId)
			});
			await this._JSProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(patent.user_Id) },
				{ $pull: { patent: { _id: new Types.ObjectId(patent.patentId) } } }
			);
			return createResponse(HttpStatus.OK, messages.S41);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	/*end deletePatent */
	//#region delete for job seeker It skills
	async deleteJobSeekerItSkillDetails(itSkills: any): Promise<AppResponse> {
		const deletedItSkills = [];
		try {
			const foundItskillsDetails = await this._JSProfileSchema.aggregate([
				{ $match: { user_id: new Types.ObjectId(itSkills.user_Id) } },
				{ $unwind: '$skills.it' },
				{ $match: { 'skills.it._id': new Types.ObjectId(itSkills.iTSkillsId) } },
				{ $project: { 'skills.it': 1 } }
			]);
			deletedItSkills.push(foundItskillsDetails);
			await this._JSProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(itSkills.user_Id) },
				{ $pull: { 'skills.it': { _id: new Types.ObjectId(itSkills.iTSkillsId.id) } } }
			);
			return createResponse(HttpStatus.OK, messages.S42);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion delete for It skills
	//#start region for delete worksample API
	async deleteWorksample(worksample: any): Promise<AppResponse> {
		try {
			await this._JSProfileSchema.find(
				{ user_id: new Types.ObjectId(worksample.user_id) },
				{ ws: { $elemMatch: { _id: new Types.ObjectId(worksample.info.id) } } }
			);
			const added = await this._JSProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(worksample.user_id) },
				{ $pull: { ws: { _id: new Types.ObjectId(worksample.info.id) } } }
			);
			if (added.modifiedCount) {
				this._loggerSvc.log(messages.S3, HttpStatus.OK);
				return createResponse(HttpStatus.OK, messages.S37);
			}
		} catch (error) {
			this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
			return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
		}
	}
	// end region for delete worksample API
	async deleteCertifications(certification: any): Promise<AppResponse> {
		try {
			await this._JSProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(certification.user_Id) },
				{ $pull: { cert: { _id: new Types.ObjectId(certification.CertificateId.id) } } }
			);
			return createResponse(HttpStatus.OK, messages.S38);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async deleteEducation(education: any): Promise<AppResponse> {
		try {
			const eduSchool = await this._JSProfileSchema.updateOne(
				{
					user_id: new Types.ObjectId(education.user_id)
				},
				{
					$pull: {
						'edu.sch': { _id: new Types.ObjectId(education.educationId) }
					}
				}
			);
			const eduDegree = await this._JSProfileSchema.updateOne(
				{
					user_id: new Types.ObjectId(education.user_id)
				},
				{
					$pull: {
						'edu.degree': { _id: new Types.ObjectId(education.educationId) }
					}
				}
			);

			if (eduSchool.modifiedCount || eduDegree.modifiedCount) {
				this._loggerSvc.log(messages.S3, HttpStatus.OK);
				return createResponse(HttpStatus.OK, messages.S43);
			} else {
				this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
				return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#region  DELETE PROJECT
	async deleteProject(data: any): Promise<AppResponse> {
		console.log(data);

		try {
			await this._JSProfileSchema.aggregate([
				{ $match: { user_id: new Types.ObjectId(data.user_id) } },
				{ $unwind: '$proj' },
				{ $match: { 'proj._id': new Types.ObjectId(data._id) } },
				{ $project: { proj: 1 } }
			]);

			const deleted = await this._JSProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(data.user_id) },
				{ $pull: { proj: { _id: new Types.ObjectId(data._id) } } }
			);
			if (deleted.modifiedCount) {
				return createResponse(HttpStatus.OK, 'Deleted Succsefully');
			} else {
				return createResponse(HttpStatus.NOT_MODIFIED, messages.E2);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	async getSkillMasterData(options: any): Promise<AppResponse> {
		try {
			const pageLimit = 10;
			let skillData: any;
			if (options.pageno === -1) {
				skillData = await this._skillSchema.aggregate([
					{
						$match: { name: { $regex: `^${options.search}`, $options: 'i' } }
					},
					{
						$project: {
							name: 1,
							_id: 0
						}
					}
				]);
			} else {
				skillData = await this._skillSchema
					.aggregate([
						{
							$match: { name: { $regex: `^${options.search}`, $options: 'i' } }
						},
						{
							$project: {
								name: 1,
								_id: 0
							}
						}
					])
					.skip(pageLimit * (options.pageno - 1))
					.limit(pageLimit);
			}
			return createResponse(HttpStatus.OK, messages.S3, skillData);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region masterdata Country & Industry
	async getCountryMaster(): Promise<AppResponse> {
		try {
			const responce = await this._countrySchema.find({ active: true }, { _id: 0, name: 1, code: 1 });

			return createResponse(HttpStatus.OK, messages.S3, responce);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async getIndustryMaster(options): Promise<AppResponse> {
		try {
			const pageLimit = 10;
			let industries: any;
			if (options.pageno === -1) {
				industries = await this._industrySchema.aggregate([
					{
						$match: { name: { $regex: `${options.search}`, $options: 'i' } }
					},
					{
						$project: {
							name: 1,
							_id: 0
						}
					}
				]);
			} else {
				industries = await this._industrySchema
					.aggregate([
						{
							$match: { name: { $regex: `^${options.search}`, $options: 'i' } }
						},
						{
							$project: {
								name: 1,
								_id: 0
							}
						}
					])
					.skip(pageLimit * (options.pageno - 1))
					.limit(pageLimit);
			}
			return createResponse(HttpStatus.OK, messages.S3, industries);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async fetchDepartments(options: any): Promise<AppResponse> {
		try {
			let data: any;
			const pageLimit = 10;
			if (options.pageno == -1) {
				data = await this._masterDepartmentsSchema.aggregate([
					{
						$match: { name: { $regex: `^${options.search}`, $options: 'i' } }
					},
					{
						$project: {
							name: 1,
							_id: 0,
							id: '$_id'
						}
					}
				]);
			} else {
				data = await this._masterDepartmentsSchema
					.aggregate([
						{
							$match: { name: { $regex: `^${options.search}`, $options: 'i' } }
						},
						{
							$project: {
								name: 1,
								_id: 0,
								id: '$_id'
							}
						}
					])
					.skip(pageLimit * (options.pageno - 1))
					.limit(pageLimit);
			}

			return createResponse(HttpStatus.OK, '', data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async fetchLocations(options: any): Promise<AppResponse> {
		try {
			let data: any;
			const pageLimit = 10;
			if (options.pageno == -1) {
				data = await this._masterLocationSchema.aggregate([
					{
						$match: { name: { $regex: `^${options.search}`, $options: 'i' } }
					},
					{
						$project: {
							name: 1,
							_id: 0
						}
					}
				]);
			} else {
				data = await this._masterLocationSchema
					.aggregate([
						{
							$match: { name: { $regex: `^${options.search}`, $options: 'i' } }
						},
						{
							$project: {
								name: 1,
								_id: 0
							}
						}
					])
					.skip(pageLimit * (options.pageno - 1))
					.limit(pageLimit);
			}

			return createResponse(HttpStatus.OK, '', data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async fetchUniversities(options: any): Promise<AppResponse> {
		try {
			const pageLimit = 10;
			let data: any;
			if (options.pageno === -1) {
				data = await this._masterInstituteSchema.aggregate([
					{
						$match: { name: { $regex: `^${options.search}`, $options: 'i' } }
					},
					{
						$project: {
							name: 1,
							_id: 0
						}
					}
				]);
			} else {
				data = await this._masterInstituteSchema
					.aggregate([
						{
							$match: { name: { $regex: `^${options.search}`, $options: 'i' } }
						},
						{
							$project: {
								name: 1,
								_id: 0
							}
						}
					])
					.skip(pageLimit * (options.pageno - 1))
					.limit(pageLimit);
			}

			return createResponse(HttpStatus.OK, '', data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
	//#region  languges _delete api
	async deleteLanguage({ claims, langId }): Promise<AppResponse> {
		try {
			await this._JSProfileSchema.updateOne(
				{ user_id: new Types.ObjectId(claims.sub) },
				{ $pull: { 'profile_info.languages': { _id: new Types.ObjectId(langId) } } }
			);
			return createResponse(HttpStatus.OK, messages.S49);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims?.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async getCategoryMasterData(categoryInfo: any, claims: AtPayload): Promise<AppResponse> {
		try {
			let data: any;
			const pageLimit = 10;
			const options: any = {
				dept_id: categoryInfo.parent_id
			};
			if (categoryInfo.active !== -1) options.active = categoryInfo.active;
			if (categoryInfo.search) options.name = { $regex: `${categoryInfo.search}`, $options: 'i' };
			if (categoryInfo.pageNo === -1) {
				data = await this._masterRoleCategorySchema.aggregate([{ $match: { ...options } }, { $project: { id: '$_id', _id: 0, name: 1 } }]);
			} else
				data = await this._masterRoleCategorySchema
					.aggregate([{ $match: { ...options } }, { $project: { id: '$_id', _id: 0, name: 1 } }])
					.skip(pageLimit * (categoryInfo.pageNo - 1))
					.limit(pageLimit);

			return createResponse(HttpStatus.OK, messages.S3, data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async getJobRoleMasterData(roleInfo: any, claims: AtPayload): Promise<AppResponse> {
		try {
			let data: any;
			const pageLimit = 10;
			const options: any = {
				ctgy_id: roleInfo.parent_id
			};
			if (roleInfo.search) options.name = { $regex: `${roleInfo.search}`, $options: 'i' };
			if (roleInfo.active !== -1) options.active = roleInfo.active;
			if (roleInfo.pageNo === -1) {
				data = await this._masterJobRoleSchema.aggregate([{ $match: { ...options } }, { $project: { id: '$_id', _id: 0, name: 1 } }]);
			} else
				data = await this._masterJobRoleSchema
					.aggregate([{ $match: { ...options } }, { $project: { id: '$_id', _id: 0, name: 1 } }])
					.skip(pageLimit * (roleInfo.pageNo - 1))
					.limit(pageLimit);
			return createResponse(HttpStatus.OK, messages.S3, data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async getCertProvider(certificateInfo: any, claims: AtPayload): Promise<AppResponse> {
		try {
			let data: any;
			const pageLimit = 10;
			const options: any = {};
			if (certificateInfo.active !== -1) options.active = certificateInfo.active;
			if (certificateInfo.search) options.name = { $regex: `${certificateInfo.search}`, $options: 'i' };
			if (certificateInfo.pageNo === -1) {
				data = await this._certProviderSchema.aggregate([{ $match: { ...options } }, { $project: { id: '$_id', _id: 0, name: 1 } }]);
			} else {
				data = await this._certProviderSchema
					.aggregate([{ $match: { ...options } }, { $project: { id: '$_id', _id: 0, name: 1 } }])
					.skip(pageLimit * (certificateInfo.pageNo - 1))
					.limit(pageLimit);
			}
			return createResponse(HttpStatus.OK, messages.S3, data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async getSpecialization(specialization: any, claims: AtPayload): Promise<AppResponse> {
		try {
			let data: any;
			const pageLimit = 10;
			const options: any = {
				strm_id: specialization.parent_id
			};
			if (specialization.active !== -1) options.active = specialization.active;
			if (specialization.search) options.name = { $regex: `${specialization.search}`, $options: 'i' };
			if (specialization.pageNo === -1) {
				data = await this._specializationSchema.aggregate([{ $match: { ...options } }, { $project: { id: '$_id', _id: 0, name: 1 } }]);
			} else
				data = await this._specializationSchema
					.aggregate([{ $match: { ...options } }, { $project: { id: '$_id', _id: 0, name: 1 } }])
					.skip(pageLimit * (specialization.pageNo - 1))
					.limit(pageLimit);

			return createResponse(HttpStatus.OK, messages.S3, data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	// #region DELETE JOBSEEKER PROFILE VIDEO , RESUME
	async deleteJobseekerDoc(docRefObj: any): Promise<AppResponse> {
		try {
			const { claims, docRef } = docRefObj;
			if (claims.sub) {
				if (docRef.name.toUpperCase() == 'VIDEO') {
					const update = await this._JSProfileSchema.updateOne(
						{ user_id: claims.sub },
						{
							$set: {
								'profile.siv': {
									name: null,
									updated_at: unix_ts_now()
								}
							}
						}
					);
					if (update.matchedCount) return createResponse(HttpStatus.OK, messages.S51);
					else return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
				} else if (docRef.name.toUpperCase() == 'RESUME') {
					const update = await this._JSProfileSchema.updateOne(
						{ user_id: claims.sub },
						{
							$set: {
								'cp.cv': {
									name: null,
									updated_at: unix_ts_now()
								}
							}
						}
					);

					if (update.matchedCount) return createResponse(HttpStatus.OK, messages.S50);
					else return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
				} else {
					this._loggerSvc.warn(messages.W3, `${HttpStatus.PARTIAL_CONTENT}`);
					return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W3);
				}
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, docRefObj.claims.sub);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	// #endregion DELETE JOBSEEKER PROFILE VIDEO , RESUME

	async getCertName(certificateInfo: any, claims: AtPayload): Promise<AppResponse> {
		try {
			let data: any;
			const pageLimit = 10;
			const options: any = {};
			if (certificateInfo.active !== -1) options.active = certificateInfo.active;
			if (certificateInfo.search) options.name = { $regex: `${certificateInfo.search}`, $options: 'i' };
			if (certificateInfo.pageNo === -1) {
				data = await this._certNameSchema.aggregate([{ $match: { ...options } }, { $project: { id: '$_id', _id: 0, name: 1 } }]);
			} else {
				data = await this._certNameSchema
					.aggregate([{ $match: { ...options } }, { $project: { id: '$_id', _id: 0, name: 1 } }])
					.skip(pageLimit * (certificateInfo.pageNo - 1))
					.limit(pageLimit);
			}
			return createResponse(HttpStatus.OK, messages.S3, data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
}
