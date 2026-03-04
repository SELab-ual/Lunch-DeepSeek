-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables for Sprint 1
CREATE TABLE IF NOT EXISTS mobile_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS restaurant_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    mobile_phone VARCHAR(20),
    verification_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_token UUID DEFAULT uuid_generate_v4()
);

CREATE TABLE IF NOT EXISTS system_stats (
    id SERIAL PRIMARY KEY,
    stat_key VARCHAR(50) UNIQUE NOT NULL,
    stat_value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial system stats
INSERT INTO system_stats (stat_key, stat_value) VALUES 
('memory_usage', '{"max_mb": 20, "current_mb": 0}'::JSONB),
('storage_usage', '{"max_mb": 20, "current_mb": 0}'::JSONB),
('system_health', '{"status": "initialized", "version": "0.1.0"}'::JSONB)
ON CONFLICT (stat_key) DO NOTHING;

-- Create indexes
CREATE INDEX idx_mobile_users_username ON mobile_users(username);
CREATE INDEX idx_mobile_users_email ON mobile_users(email);
CREATE INDEX idx_restaurant_owners_username ON restaurant_owners(username);
CREATE INDEX idx_restaurant_owners_email ON restaurant_owners(email);
CREATE INDEX idx_restaurant_owners_status ON restaurant_owners(verification_status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_mobile_users_updated_at BEFORE UPDATE ON mobile_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_owners_updated_at BEFORE UPDATE ON restaurant_owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();