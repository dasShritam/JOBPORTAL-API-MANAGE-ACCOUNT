export class AppConfigService {
	private readonly envConfig: { [key: string]: any } = {};
	constructor() {
		/*App configurations*/
		this.envConfig.app = {
			port: parseInt(process.env.MANAGE_AC_PORT, 10),
			environment: process.env.ENVIRONMENT
		};

		/*Database*/
		this.envConfig.db = {
			mongo: {
				uri: process.env.APP_CONNECTIONSTRING_MONGO
			}
		};

		/*blob configuration*/
		this.envConfig.blobStorage = {
			blobAccountName: process.env.BLOB_AC_NAME,
			blobAccountKey: process.env.BLOB_AC_KEY,
			blobAccountConnectionString: process.env.BLOB_CONNECTION_STRING,
			blobLoggerContainer: process.env.BLOB_LOGGER_CONTAINER,
			blobCommonContainer: process.env.BLOB_COMMON_CONTAINER,
			blobEmployerContainer: process.env.BLOB_EMPLOYER_CONTAINER,
			blobJobSeekerContainer: process.env.BLOB_JOBSEEKER_CONTAINER,
			linkValidity: process.env.BLOB_LINK_LIVE_INMIN
		};

		/*Logger*/
		this.envConfig.logger = {
			logLevel: process.env.LOG_LEVEL
		};

		/*Password*/
		this.envConfig.pwd = {
			maxPwdHistory: process.env.MAX_PWD_HISTORY,
			verfiyLinkExpiry: process.env.VERIFY_LINK_EXPIRY_DAY
		};

		this.envConfig.jsProfileWeightage = {
			ph_verified: 10,
			email_verified: 10,
			name: 5,
			gender: 5,
			intro_video: 20,
			headline: 10,
			cv: 10,
			it: 10,
			schools: 10,
			degree: 10
		};

		/*Init mail credentials*/
		this.envConfig.mailConfig = {
			transport: {
				host: process.env.MAIL_SVC_HOST,
				port: 587,
				auth: {
					user: process.env.MAIL_SVC_USERNAME,
					pass: process.env.MAIL_SVC_PASSWORD
				},
				tls: {
					rejectUnauthorized: false
				}
			},
			defaults: {
				from: {
					name: process.env.MAIL_SVC_FROM_NAME,
					address: process.env.MAIL_SVC_FROM
				}
			}
		};

		/* Email Template Cred */
		this.envConfig.emailTemplate = {
			contactUs: process.env.EMAIL_TEMP_CONTACT_US,
			Email: process.env.EMAIL_TEMP_EMAIL,
			uiUrl: process.env.UI_URL
		};
	}

	get(key: string): any {
		return this.envConfig[key];
	}
}
