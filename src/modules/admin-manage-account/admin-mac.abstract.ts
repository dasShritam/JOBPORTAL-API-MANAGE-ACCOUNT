import { AppResponse } from '@app/shared/appresponse.shared';
import { EmployerRegisterDto } from './models/adminEmpRegister';

export abstract class AbstractAdminMacSvc {
	abstract empJsReport(claims: any): Promise<AppResponse>;
	abstract empJsDetails(claims: any): Promise<AppResponse>;
	abstract empRegister(empReg: EmployerRegisterDto, ip: string, userClaims: any): Promise<AppResponse>;
	abstract jobSeekerSelfRegister(jsDetails, ip): Promise<any>;
}
