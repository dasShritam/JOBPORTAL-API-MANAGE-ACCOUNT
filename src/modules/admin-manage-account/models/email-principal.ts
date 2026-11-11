import { ISendMailOptions } from '@nestjs-modules/mailer';

export interface SendEmailDto {
	readonly filePath: string;
	readonly replacements: any;
	readonly mailOptions: ISendMailOptions;
}
