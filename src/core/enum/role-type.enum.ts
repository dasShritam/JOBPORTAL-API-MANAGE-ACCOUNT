export enum RoleType {
	ADMINISTRATOR = 'ADMINISTRATOR',
	JOBSEEKER = 'JOBSEEKER',
	EMPLOYER = 'EMPLOYER'
}

export class AppRole {
	static readonly ALL_ROLES: RoleType[] = [RoleType.ADMINISTRATOR, RoleType.JOBSEEKER, RoleType.EMPLOYER];
}
