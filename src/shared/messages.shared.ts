export function messageFactory(message: string, msgParams?: string[]): string {
	if (msgParams) {
		msgParams.forEach((val, key) => {
			message = message.split(`ARG${key}`).join(val?.toString());
		});
	}
	return message;
}

export const enum messages {
	//ARG0,ARG1 ... ARGn should be in sequence.

	//Success messages : Start with Sn
	S1 = 'Techkri manage account service is up and running',
	S2 = 'Connected to mongo db!',
	S3 = 'Success',
	S4 = 'Know your customer (KYC) information updated successfully',
	S5 = 'Company information updated successfully.',
	S6 = 'Presentation has been updated successfully.',
	S7 = 'Presentation has been added successfully.',
	S8 = 'Project has been updated successfully.',
	S9 = 'Project has been added successfully.',
	S10 = 'key Skills has been updated successfully.',

	S11 = 'Education has been updated successfully.',
	S12 = 'IT Skill has been updated successfully.',

	S13 = 'Publication has been added successfully.',
	S14 = 'Publication has been updated successfully.',

	S15 = 'Patent has been added successfully.',
	S16 = 'Patent has been updated successfully.',

	S19 = 'Certification has been updated successfully.',
	S20 = 'Certification has been added successfully.',

	S21 = 'Personal Details has been updated successfully.',

	S26 = 'Jobseeker registered successfully.',

	S29 = 'File uploaded successfully.',
	S30 = 'Online profile has been added successfully.',
	S31 = 'Online profile has been updated successfully.',

	S22 = 'Profile Summary has been successfully saved.',
	S23 = 'Resume Headline has been successfully saved.',
	S24 = 'Work Sample has been added successfully.',
	S25 = 'Work Sample has been updated successfully.',
	S27 = 'Career Profile has been updated successfully.',
	S28 = 'Basic Details has been updated successfully.',
	S32 = 'Account Details has been Updated Successfully.',
	S33 = 'Your file has been successfully uploaded.',
	S34 = 'Employement has been added successfully.',
	S35 = 'Employement has been updated successfully.',

	S36 = 'New User',
	S37 = 'Work Sample has been deleted successfully.',
	S38 = 'Certification has been deleted successfully.',
	S39 = 'Presentation has been deleted successfully.',
	S40 = 'Employement has been deleted successfully.',
	S41 = 'Patent has been deleted successfully.',
	S42 = 'IT Skill has been deleted successfully.',
	S43 = 'Education has been deleted Successfully.',
	S44 = 'Project has been deleted successfully.',
	S45 = 'Online Profile has been deleted successfully.',
	S46 = 'Publication has been deleted successfully.',
	S49 = 'Language has been deleted successfully',
	S50 = 'Resume has been deleted successfully',
	S51 = 'Video has been deleted successfully',
	S52 = 'Techkri manage account service is listening on ARG0',
	S53 = 'IT skills has been added successfully',

	//Warning messages : Start with Wn

	W1 = 'Please provide a valid ARG0!',
	W2 = 'ARG0 should not be empty!',

	W3 = 'Invalid Request please check your data',
	W4 = 'Project Description should not be more than 1000 character',
	W5 = 'Role Description should not be more than 1000 character',
	W6 = 'Presentation Description should not be more than 1000 character',
	W7 = 'Maximum number of skills are 30',

	W8 = 'ARG0 should  be an number',
	W9 = 'Publication Description should not be more than 500 character',
	W10 = 'DurationFrom should be greaterthan DurationFrommonth',
	W11 = ' DurationTomomth should be greaterthan DurationTo',
	W12 = ' Profile descDescription should not be more than 500 character',
	W13 = 'User account or profile information not found!',
	W14 = 'You have already added your 10th class details. You cannot add them again!',
	W15 = 'You have already added your 12th class details. You cannot add them again!',
	W16 = 'Entered email id already exists',
	W17 = 'Uploaded file format is not allowed. Only .mp4, .m4v, and .mkv format is allowed!',
	W18 = 'Uploaded file format is not allowed. Only .pdf, doc, .docx, and .rtf format is allowed!',
	W19 = 'Uploaded file format is not allowed. Only .png, .jpg and .jpeg format is allowed!',
	W20 = 'Entered phone number already exists',

	//Error messages : Start with En
	E1 = 'Techri manage account service start failed! :: ARG0',
	E2 = 'Oops! An error occurred while processing your request',
	E3 = 'Unauthorized request!',
	E4 = 'An error occurred while establishing connection to mongo db : ARG0',
	E5 = 'Mongo database connection disconnected!',
	E6 = 'Mongo database connection disconnected through app termination!',
	E7 = 'The employer with the id : ARG0 does not exist',

	E8 = 'User Not Found',
	E9 = 'The employer with the Pan Number : ARG0 already exist',
	E10 = 'The Jobseeker does not exist',
	E11 = 'Oops! An error occured while sending email',
	E12 = 'Image not found !',
	E13 = 'File not found !',
	E14 = 'Upload failed !'
}
