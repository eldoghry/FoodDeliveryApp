import generalSwaggerSchema from './general.schema';
import userSwaggerSchema from './user.schema';
import productSwaggerSchema from './product.schema';
import cartSwaggerSchema from './cart.schema';

const swaggerSchemas = {
	...generalSwaggerSchema,
	...userSwaggerSchema,
	...productSwaggerSchema,
	...cartSwaggerSchema
};

export default swaggerSchemas;
