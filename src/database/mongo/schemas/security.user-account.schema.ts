import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const SecurityUserAccountSchema = new Schema<any>(
	{
		uname: { type: SchemaTypes.String, required: true, unique: true },
		name: { type: SchemaTypes.String, required: true },
		/*Contact information*/
		ci: {
			/*Primary or secondary contact information*/
			prim: {
				ph: {
					code: { type: SchemaTypes.String },
					val: { type: SchemaTypes.String },
					/*Is verified*/
					iv: { type: SchemaTypes.Boolean, default: false }
				},
				mail: {
					val: { type: SchemaTypes.String },
					/*Is verified*/
					iv: { type: SchemaTypes.Boolean, default: false }
				}
			}
		},
		/*Social network*/
		soc_net: [
			{
				_id: false,
				id: { type: SchemaTypes.String },
				name: { type: SchemaTypes.String },
				created_at: { type: SchemaTypes.Number }
			}
		],
		pwd: [
			/*Password*/
			{
				hash: { type: SchemaTypes.String },
				created_at: { type: SchemaTypes.Number },
				active: { type: SchemaTypes.Boolean, default: true }
			}
		],
		role: { type: SchemaTypes.String, required: true } /*Jobseeker,Employer or Admin*/,
		reg_mode: { type: SchemaTypes.String, required: true } /*Credentials or Google or Twitter or Linked In or Facebook*/,
		login_enabled: { type: SchemaTypes.Boolean, default: true },
		active: { type: SchemaTypes.Boolean, default: true },
		created_by: { type: SchemaTypes.ObjectId, required: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	{ ...mongo_ts_opts }
);

/*

*/

SecurityUserAccountSchema.index({ uname: 'hashed' });

const createSecurityUserAccountSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('SecurityUserAccount', SecurityUserAccountSchema, 'SecurityUserAccounts');

export { createSecurityUserAccountSchema, SecurityUserAccountSchema };
