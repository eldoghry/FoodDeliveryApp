CREATE TABLE restaurant (
    restaurant_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(512) DEFAULT '',              
    phone_number VARCHAR(20),                      
    email VARCHAR(255),                            
    location JSONB,                                
    is_active BOOLEAN NOT NULL DEFAULT TRUE,       
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
