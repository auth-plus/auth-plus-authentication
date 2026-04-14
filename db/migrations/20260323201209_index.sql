-- migrate:up
CREATE INDEX idx_user_email ON "user"("email");
CREATE INDEX idx_user_info_user_type ON "user_info"("user_id", "type");
CREATE INDEX idx_user_info_user_id ON "user_info"("user_id");
CREATE INDEX idx_org_user_org_user ON "organization_user"("organization_id", "user_id");
CREATE INDEX idx_mfa_user_strategy_enabled ON "multi_factor_authentication"("user_id", "strategy", "is_enable");

-- migrate:down

DROP INDEX IF EXISTS idx_user_email;
DROP INDEX IF EXISTS idx_user_info_user_type;
DROP INDEX IF EXISTS idx_user_info_user_id;
DROP INDEX IF EXISTS idx_org_user_org_user;
DROP INDEX IF EXISTS idx_mfa_user_strategy_enabled;