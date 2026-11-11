import { AppConfigService } from '@app/config/appconfig.service';
import AppLogger from '@app/core/logger/app-logger';
import { AccountMailService } from '@app/core/mail/mail.service';
import { unix_ts_now } from '@app/core/utils/timestamp.utils';
import { DatabaseService } from '@app/database/database.service';
import { AbstractManageAccountDao } from '@app/database/mongo/abstract/manage-account.abstract';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { BlobServiceClient } from '@azure/storage-blob';
import { ISendMailOptions } from '@nestjs-modules/mailer';
import { HttpStatus, Injectable } from '@nestjs/common';
import { createHmac, randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import { Types } from 'mongoose';
import { join } from 'path';
import { AbstractAdminMacSvc } from './admin-mac.abstract';
import { EmployerRegisterDto } from './models/adminEmpRegister';
import { blobInfo } from './models/blob-principle.model';
import { SendEmailDto } from './models/email-principal';

@Injectable()
export class AdminMacService implements AbstractAdminMacSvc {
	private readonly _manageAcTxn: AbstractManageAccountDao;
	constructor(
		private readonly _appConfigSvc: AppConfigService,
		private readonly _loggerSvc: AppLogger,
		readonly _dbSvc: DatabaseService,
		private _mailService: AccountMailService
	) {
		this._manageAcTxn = _dbSvc.manageAcTxn;
	}
	async empJsReport(claims: any): Promise<AppResponse> {
		try {
			return await this._manageAcTxn.fetchEmpJsReport(claims);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async empJsDetails(claims: any): Promise<AppResponse> {
		try {
			return await this._manageAcTxn.fetchEmpJsDetails(claims);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region General Fucntions
	private async generateTempUniqueToken(): Promise<string> {
		try {
			return createHmac('sha512', randomBytes(32).toString('base64')).update(`${new Types.ObjectId()} ${unix_ts_now()}`).digest('hex');
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return '';
		}
	}

	async sendEmail(emailInfo: SendEmailDto) {
		try {
			const file = join(__dirname, emailInfo.filePath),
				source = readFileSync(file, 'utf-8'),
				template = compile(source),
				replacements = emailInfo.replacements,
				htmlToSend = template(replacements),
				mailOptions: ISendMailOptions = {
					to: emailInfo.mailOptions.to,
					subject: emailInfo.mailOptions.subject,
					html: htmlToSend,
					text: emailInfo.mailOptions.text
				};
			await this._mailService.sendEmail(mailOptions);
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E11);
		}
	}
	//#endregion General Fucntions

	//#region Employer Registration
	async checkMail(empMail: string): Promise<AppResponse> {
		try {
			const responce1 = await this._manageAcTxn.getMail(empMail);
			if (responce1.code !== 200) return responce1;
			return createResponse(HttpStatus.OK, messages.S34);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async empRegister(empRegDetails: EmployerRegisterDto, ip: string, userClaims: any): Promise<AppResponse> {
		try {
			const emailtemp = this._appConfigSvc.get('emailTemplate');
			const tempToken = await this.generateTempUniqueToken(); //need to get func
			const responce = await this.checkMail(empRegDetails.empMail);
			const env = this._appConfigSvc.get('pwd');
			if (responce.code !== 200) return responce;
			const result = await this._manageAcTxn.postEmpRegister(empRegDetails, ip, tempToken, userClaims.sub, env?.verfiyLinkExpiry);
			if (result.code !== 200) return result;
			if (empRegDetails.empAccess) {
				const verifyUrl = `${emailtemp?.uiUrl}/employerverifications?id=${tempToken}&isTrue=1`;
				const emailInfo: SendEmailDto = {
						filePath: '../core/mail/templates/empAccActivate.html',
						replacements: {
							emailURl: verifyUrl,
							contactUs: emailtemp.contactUs,
							contactEmail: emailtemp.Email
						},
						mailOptions: {
							to: empRegDetails.empMail,
							subject: `TECHKRI | VERIFY EMPLOYER`,
							text: 'Employer verification'
						}
					},
					emailRes = await this.sendEmail(emailInfo); //genaral Maill part
				if (emailRes.code !== 200) return emailRes;
			}
			return createResponse(HttpStatus.OK, messages.S9);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion Employer Registration

	//#region Jobseeker Reg

	/*Upload file blob*/
	async uploadFileToBlob(blobInfo: blobInfo): Promise<AppResponse> {
		try {
			const blobData = this._appConfigSvc.get('blobStorage'),
				connString = blobData.blobAccountConnectionString,
				containerName = blobData.blobJobSeekerContainer,
				blobServiceClient = BlobServiceClient.fromConnectionString(connString),
				blobContainer = blobServiceClient.getContainerClient(containerName),
				blobDirectory = blobInfo.dirName,
				fileName = blobContainer.getBlockBlobClient(`${blobDirectory}/${blobInfo.fileName}`),
				fileData = Buffer.from(blobInfo.file);
			fileName.uploadData(fileData);
			return createResponse(HttpStatus.OK, messages.S3, blobInfo.fileName);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async jobSeekerSelfRegister(jsDetails: any, ip: string): Promise<any> {
		try {
			const emailtemp = this._appConfigSvc.get('emailTemplate');
			const _id = new Types.ObjectId();
			let resumeName = '';
			let resumeBuffer: any = null;
			if (jsDetails?.files?.resume) {
				resumeName = `${unix_ts_now()}-${jsDetails?.files?.resume[0].originalname}`;
				resumeBuffer = jsDetails.files.resume[0].buffer;
			}
			const userid = jsDetails.user_Id;

			const blobData = this._appConfigSvc.get('blobStorage');

			try {
				if (resumeBuffer != null) {
					const resumeInfo = {
						blobContainerName: blobData.blobJobSeekerContainer,
						dirName: `${_id.toString()}/resume`,
						fileName: resumeName,
						file: resumeBuffer
					};
					await this.uploadFileToBlob(resumeInfo);
				}
			} catch (error) {
				this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
				return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			}
			const tempToken = await this.generateTempUniqueToken();
			const modalData = jsDetails.jsDetails.jsProfile;
			const email = modalData.email;
			const env = this._appConfigSvc.get('pwd');
			modalData._id = _id;
			modalData.resumeName = resumeName;
			modalData.createdBy = userid;

			const response = await this.checkMail(email);

			if (response.code === 302) {
				return createResponse(HttpStatus.PARTIAL_CONTENT, response.message);
			} else {
				const dbRes = await this._manageAcTxn.jobSeekerSelfRegister(modalData, ip, tempToken, env?.verfiyLinkExpiry);
				if (dbRes.code == 200) {
					if (modalData.access) {
						const verifyUrl = `${emailtemp?.uiUrl}/employerverifications?id=${tempToken}`;
						const emailInfo: SendEmailDto = {
								filePath: '../core/mail/templates/empAccActivate.html',
								replacements: {
									emailURl: verifyUrl,
									contactUs: emailtemp.contactUs,
									contactEmail: emailtemp.Email
								},
								mailOptions: {
									to: modalData.email,
									subject: `TECHKRI | VERIFY JOBSEEKER`,
									text: 'Jobseeker verification'
								}
							},
							emailRes = await this.sendEmail(emailInfo); //genaral Maill part
						if (emailRes.code !== 200) return emailRes;
						return createResponse(HttpStatus.OK, messages.S26, userid);
					}
					if (dbRes.code === 200) {
						return createResponse(HttpStatus.OK, messages.S26, userid);
					} else {
						return createResponse(HttpStatus.BAD_REQUEST, messages.E9);
					}
				} else {
					return createResponse(dbRes.code, dbRes.message);
				}
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
}
