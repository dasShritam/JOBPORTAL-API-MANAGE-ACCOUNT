import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication) => {
	const config = new DocumentBuilder().setTitle('TECHKRI MANAGE ACCOUNT API DOCUMENTATION').setVersion('1.0').addBearerAuth().build(),
		swaggerDoc = SwaggerModule.createDocument(app, config),
		customOptions: SwaggerCustomOptions = {
			customSiteTitle: 'Techkri Manage Account API',
			customCss: `.swagger-ui .topbar { background-color: #ffffff; border-bottom: 5px solid #3f51b5; }`
		};
	//writeFileSync('./manage-account-swagger-spec.json', JSON.stringify(swaggerDoc));

	SwaggerModule.setup('api/docs/swagger', app, swaggerDoc, customOptions);
};
