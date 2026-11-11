import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const ProfileEmployerSchema = new Schema<any>(
	{
		user_id: { type: SchemaTypes.ObjectId, required: true, unique: true },
		/*Organization profile information*/
		profile: {
			name: { type: SchemaTypes.String, required: true },
			ind: { type: SchemaTypes.String } /*Type of Industry*/,
			alias: { type: SchemaTypes.String, default: null },
			/*Point of contact information*/
			poc: {
				name: { type: SchemaTypes.String, required: true },
				role: { type: SchemaTypes.String, required: true } /* Designation or role of contact person*/,
				ph: {
					prim: { type: SchemaTypes.String, required: true } /*Primary contact phone number*/,
					secd: { type: SchemaTypes.String, default: null } /*Secondary contact phone number*/
				}
			},
			web: { type: SchemaTypes.String, default: null } /*Website URL*/,
			logo: {
				name: { type: SchemaTypes.String } /*File name with extension*/,
				updated_at: { type: SchemaTypes.Number }
			},
			hvpf: { type: SchemaTypes.String } /*Profile for Hot Vacancies*/,
			clpf: { type: SchemaTypes.String } /*Profile for Classifieds*/,
			fax: { type: SchemaTypes.String },
			tan: { type: SchemaTypes.String },
			adr: {
				street: { type: SchemaTypes.String },
				city: { type: SchemaTypes.String },
				state: { type: SchemaTypes.String },
				country: { type: SchemaTypes.String },
				zip: { type: SchemaTypes.Number }
			}
		},
		tc: { type: SchemaTypes.Boolean, default: false } /*Terms and conditions are accepeted*/,
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createProfileEmployerSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('ProfileEmployer', ProfileEmployerSchema, 'ProfileEmployers');

export { createProfileEmployerSchema, ProfileEmployerSchema };
