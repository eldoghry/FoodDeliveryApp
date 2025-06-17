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
    AddressBodyRequest:{
        type: 'object',
        required: ['city', 'area', 'street', 'coordinates'],
        properties: {
            label: { type: 'string', description: 'The label of the address.', example: 'Home' },
            city: { type: 'string', description: 'The city of the address.', example: 'New York' },
            area: { type: 'string', description: 'The area of the address.', example: 'Manhattan' },
            street: { type: 'string', description: 'The street of the address.', example: '123 Main St' },
            building: { type: 'string', description: 'The building of the address.', example: '123' },
            floor: { type: 'string', description: 'The floor of the address.', example: '1' },
            coordinates: { type: 'object', description: 'The coordinates of the address.', example: { lat: 40.7128, lng: -74.0060 } },
        }
    },
    Address: {
        type: 'object',
        properties: {
            addressId: { type: 'integer', description: 'The ID of the address.', example: 1 },
            customerId: { type: 'integer', description: 'The ID of the customer.', example: 1 },
            label: { type: 'string', description: 'The label of the address.', example: 'Home' },
            city: { type: 'string', description: 'The city of the address.', example: 'New York' },
            area: { type: 'string', description: 'The area of the address.', example: 'Manhattan' },
            street: { type: 'string', description: 'The street of the address.', example: '123 Main St' },
            building: { type: 'string', description: 'The building of the address.', example: '123' },
            floor: { type: 'string', description: 'The floor of the address.', example: '1' },
            coordinates: { type: 'object', description: 'The coordinates of the address.', example: { lat: 40.7128, lng: -74.0060 } },
            isDefault: { type: 'boolean', description: 'Whether the address is the default address.', example: true },
        }
    },
    AddressResponse: {
        type: 'object',
        properties: {
            data: {
                type: 'array',
                items: { $ref: '#/components/schemas/Address' }
            }
        }
    },
};

export default swaggerSchema;