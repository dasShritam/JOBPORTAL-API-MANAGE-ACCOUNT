import { ObjectId } from 'mongoose';

export interface TemporaryTokenModel {
	token?: string;
	user_id?: ObjectId;
	ip?: string;
	data?: string;
	exp_ts?: number;
	created_at?: number;
	updated_at?: number;
}
