import generalSwaggerSchema from './general.schema';
import userSwaggerSchema from './user.schema';
import productSwaggerSchema from './product.schema';
import cartSwaggerSchema from './cart.schema';
import orderSwaggerSchema from './order.schema';
import customerSwaggerSchema from './customer.schema';

const swaggerSchemas = {
	...generalSwaggerSchema,
	...userSwaggerSchema,
	...productSwaggerSchema,
	...cartSwaggerSchema,
	...orderSwaggerSchema,
	...customerSwaggerSchema
};

export default swaggerSchemas;
