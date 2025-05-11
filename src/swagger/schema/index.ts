import userSwaggerSchema from './user.schema';
import productSwaggerSchema from './product.schema';

const swaggerSchemas = { ...userSwaggerSchema, ...productSwaggerSchema };

export default swaggerSchemas;
