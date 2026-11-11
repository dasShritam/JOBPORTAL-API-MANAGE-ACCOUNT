import { Authorize } from '@app/core/decorators/authorization.decorator';
import { createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { Body, Controller, Get, Injectable, Post, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { getClientIp } from 'request-ip';
import { AbstractAdminMacSvc } from './admin-mac.abstract';
import { AdminEmployerRegisterDto, AdminJobSeekerRegDto, JsDetailsDto } from './dto';

@Injectable()
@Controller('manageac')
@ApiTags('Manage Account')
export class AdminMacController {
	constructor(private readonly _adminMacSvc: AbstractAdminMacSvc) {}

	/*Employer and Jobseeker report*/
	@Authorize()
	@Get('empjsreport')
	async empJsReport(@Req() req: any) {
		return this._adminMacSvc.empJsReport(req.claims);
	}

	@Authorize()
	@Post('empjsdetails')
	async empJsDetails(@Req() req: any, @Body() jsDetailsInfo: JsDetailsDto) {
		return this._adminMacSvc.empJsDetails({ ...jsDetailsInfo, user_Id: req.claims.sub });
	}

	@Post('employer-register')
	@Authorize()
	@ApiBearerAuth()
	async employerRegister(@Req() req: any, @Body() empRegDetail: AdminEmployerRegisterDto) {
		const employerRegInfo: any = empRegDetail;
		return this._adminMacSvc.empRegister(employerRegInfo, getClientIp(req), req.claims);
	}

	@Post('jobseekerSelfRegistration')
	@Authorize()
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: 'resume', maxCount: 1 },
			{ name: 'video', maxCount: 1 }
		])
	)
	async jobSeekerSelfRegister(
		@Req() req: any,
		@Body() jsDetails: AdminJobSeekerRegDto,
		@UploadedFiles()
		files: { resume?: Express.Multer.File[]; video?: Express.Multer.File[] }
	) {
		const jsObject = {
			user_Id: req.claims.sub,
			files,
			jsDetails: jsDetails
		};

		if (files?.resume && files?.resume.length && !/^application\/(pdf|doc|docx|msword)$/i.test(files?.resume[0]?.mimetype)) {
			return createResponse(206, messages.W18);
		}
		if (files?.video && files?.video.length && !/^video\/(m4v|mkv|mp4)$/i.test(files?.video[0]?.mimetype)) {
			return createResponse(206, messages.W17);
		}
		return this._adminMacSvc.jobSeekerSelfRegister(jsObject, getClientIp(req));
	}
	//#endregion
}
