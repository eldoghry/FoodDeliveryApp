import swaggerJSDoc, { SwaggerDefinition } from 'swagger-jsdoc';
import swaggerSchemas from './schema';

const options: swaggerJSDoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: { title: 'Food Deliver Api', description: 'A sample API', version: '1.0.0' },
		servers: [
			{
				url: 'http://localhost:4000/api/v1',
				description: 'Development server'
			}
		],
		components: {
			schemas: { ...swaggerSchemas } // dynamic add schema
		}
	},
	apis: ['./src/routes/*.routes.ts']
};

const swaggerJsDocSpecs = swaggerJSDoc(options);

export default swaggerJsDocSpecs;
