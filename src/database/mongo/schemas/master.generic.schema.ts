import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

enum MASTER_SCHEMA_GROUP {
	NPRD /*Notice period*/,
	EDUN /*Education*/,
	GSYS /*Grading system*/,
	MAST /*Marital status*/,
	CTGY /*Category*/,
	CRCY /*Currency*/,
	PWDT /*Pearson with disability type*/,
	REOB /*Reason for break*/,
	WPUS /*Work permit for USA*/,
	EDUM /*Education medium*/,
	BAUG /*Bachelor(or)Under-Graduation*/,
	MAPG /*Masters(or)Post-Graduation*/,
	DPHD /*Doctorate(or)PhD*/,
	TMPE /*Total Marks In Percentage*/,
	SBCB /*School board is central board*/,
	SBSB /*School board is state board*/,
	WPOC /*Work Permit for Other Countries*/,
	WDIV /*Work Diversity*/,
	LNPR /*Language Proficiency*/
}
const MasterGenericSchema = new Schema<any>(
	{
		grp: { type: SchemaTypes.String, required: true, enum: [MASTER_SCHEMA_GROUP] },
		name: { type: SchemaTypes.String, required: true, unique: true },
		active: { type: SchemaTypes.Boolean, default: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	{
		...mongo_ts_opts,
		shardKey: {
			grp: 1
		}
	}
);

const createMasterGenericSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('MasterGeneric', MasterGenericSchema, 'MasterGenerics');

export { createMasterGenericSchema, MasterGenericSchema, MASTER_SCHEMA_GROUP };
