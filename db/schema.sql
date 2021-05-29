SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

--
-- Name: administrator; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.administrator (
    id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    user_id uuid NOT NULL
);


--
-- Name: multi_factor_authentication; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.multi_factor_authentication (
    id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    user_id uuid NOT NULL,
    strategy character varying(32) NOT NULL
);


--
-- Name: organization; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization (
    id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    name character varying(128) NOT NULL,
    document character varying(64) NOT NULL,
    document_type character varying(32) NOT NULL
);


--
-- Name: organization_manager; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_manager (
    id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL
);


--
-- Name: organization_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_user (
    id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    name character varying(128) NOT NULL,
    email character varying(64) NOT NULL
);


--
-- Name: administrator administrator_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrator
    ADD CONSTRAINT administrator_pkey PRIMARY KEY (id);


--
-- Name: multi_factor_authentication multi_factor_authentication_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.multi_factor_authentication
    ADD CONSTRAINT multi_factor_authentication_pkey PRIMARY KEY (id);


--
-- Name: organization_manager organization_manager_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_manager
    ADD CONSTRAINT organization_manager_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization_user organization_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_user
    ADD CONSTRAINT organization_user_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: administrator fk_administrator_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrator
    ADD CONSTRAINT fk_administrator_user FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: multi_factor_authentication fk_mfa_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.multi_factor_authentication
    ADD CONSTRAINT fk_mfa_user FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: organization_manager fk_om_organization; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_manager
    ADD CONSTRAINT fk_om_organization FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: organization_manager fk_om_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_manager
    ADD CONSTRAINT fk_om_user FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: organization_user fk_ou_organization; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_user
    ADD CONSTRAINT fk_ou_organization FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: organization_user fk_ou_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_user
    ADD CONSTRAINT fk_ou_user FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20210526220337'),
    ('20210527202631');
