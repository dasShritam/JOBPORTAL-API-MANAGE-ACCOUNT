import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountMailService {
	constructor(private mailerService: MailerService) {}

	async sendEmail(mailOptions: ISendMailOptions) {
		return await this.mailerService.sendMail(mailOptions);
	}
}
