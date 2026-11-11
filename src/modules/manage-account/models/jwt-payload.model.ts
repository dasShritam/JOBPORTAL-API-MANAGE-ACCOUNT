export interface AtPayload {
	readonly sub: string;
	readonly roles: string[];
	readonly sid: string;
	readonly username: string;
	readonly name: string;
	readonly ip_address: string;
}
