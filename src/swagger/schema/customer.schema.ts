const swaggerSchema = {
	Customer: {
		type: 'object',
		properties: {
			customerId: { type: 'integer', description: 'The ID of the customer.', example: 1 },
			userId: { type: 'integer', description: 'The ID of the user.', example: 1 },
			birthDate: { type: 'date', description: 'The birth date of the customer.', example: '2020-01-01' },
			gender: { type: 'string', description: 'The gender of the customer.', example: 'male' },
		}
	},
    Address: {
        type: 'object',
        properties: {
            addressId: { type: 'integer', description: 'The ID of the address.', example: 1 },
            customerId: { type: 'integer', description: 'The ID of the customer.', example: 1 },
            addressLine1: { type: 'string', description: 'The street of the address.', example: '123 Main St' },
            addressLine2: { type: 'string', description: 'The city of the address.', example: 'New York' },
            city: { type: 'string', description: 'The state of the address.', example: 'NY' },
            isDefault: { type: 'boolean', description: 'Whether the address is the default address.', example: true },
        }
    }
};

export default swaggerSchema;