import { ObjectId } from 'mongoose';

export interface AppSessionModel {
	user_id?: ObjectId;
	role?: string;
	start_ts?: number;
	end_ts?: number;
	device?: {
		id?: string;
		ua?: string;
	};
	ip?: [
		{
			adr?: string;
			start_ts?: number;
		}
	];
	created_at?: number;
	updated_at?: number;
}
