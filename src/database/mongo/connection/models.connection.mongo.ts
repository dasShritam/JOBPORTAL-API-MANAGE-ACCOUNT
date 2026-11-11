import { MongoConstants } from '@app/database/mongo/connection/constants.mongo';
import { Connection } from 'mongoose';
import {
	createLogAppSessionSchema,
	createMasterCertProviderSchema,
	createMasterCompanySchema,
	createMasterCountrySchema,
	createMasterDepartmentSchema,
	createMasterDesignationSchema,
	createMasterEducationSchema,
	createMasterGenericSchema,
	createMasterIndustrySchema,
	createMasterInstituteSchema,
	createMasterJobRoleCategorySchema,
	createMasterJobRoleSchema,
	createMasterLocationSchema,
	createMasterSkillSchema,
	createMasterSpecializationSchema,
	createProfileEmployerSchema,
	createProfileJobSeekerSchema,
	createSecurityOtpTraceSchema,
	createSecurityTemporaryTokenSchema,
	createSecurityUserAccountSchema
} from '../schemas';
import { createMasterCertNameSchema } from '../schemas/master.cert-name.schema';

const mongoDbModelsProvider = [
	{
		provide: MongoConstants.APP_SESSION_SCHEMA,
		useFactory: (connection: Connection) => createLogAppSessionSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.CERT_NAME_SCHEMA,
		useFactory: (connection: Connection) => createMasterCertNameSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.CERT_PROVIDER_SCHEMA,
		useFactory: (connection: Connection) => createMasterCertProviderSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.COMPANY_SCHEMA,
		useFactory: (connection: Connection) => createMasterCompanySchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.COUNTRY_SCHEMA,
		useFactory: (connection: Connection) => createMasterCountrySchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.DEPARTMENT_SCHEMA,
		useFactory: (connection: Connection) => createMasterDepartmentSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.DESIGNATION_SCHEMA,
		useFactory: (connection: Connection) => createMasterDesignationSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.EDUCATION_SCHEMA,
		useFactory: (connection: Connection) => createMasterEducationSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.GENERIC_SCHEMA,
		useFactory: (connection: Connection) => createMasterGenericSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.INDUSTRY_SCHEMA,
		useFactory: (connection: Connection) => createMasterIndustrySchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.INSTITUTE_SCHEMA,
		useFactory: (connection: Connection) => createMasterInstituteSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.JOB_ROLE_CATEGORY_SCHEMA,
		useFactory: (connection: Connection) => createMasterJobRoleCategorySchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.JOB_ROLE_SCHEMA,
		useFactory: (connection: Connection) => createMasterJobRoleSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.LOCATION_SCHEMA,
		useFactory: (connection: Connection) => createMasterLocationSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.SKILL_SCHEMA,
		useFactory: (connection: Connection) => createMasterSkillSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.SPECIALIZATION_SCHEMA,
		useFactory: (connection: Connection) => createMasterSpecializationSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.EMPLOYER_PROFILE_SCHEMA,
		useFactory: (connection: Connection) => createProfileEmployerSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.JOBSEEKER_PROFILE_SCHEMA,
		useFactory: (connection: Connection) => createProfileJobSeekerSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.OTP_TRACE_SCHEMA,
		useFactory: (connection: Connection) => createSecurityOtpTraceSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.TEMPORARY_TOKEN_SCHEMA,
		useFactory: (connection: Connection) => createSecurityTemporaryTokenSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.USER_ACCOUNT_SCHEMA,
		useFactory: (connection: Connection) => createSecurityUserAccountSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	}
];

export { mongoDbModelsProvider };
