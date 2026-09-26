-- ============================================================
-- BIS-SAKHI DATABASE SCHEMA
-- SIH 2026 - SIH26107
-- PostgreSQL 18
-- ============================================================

-- 1. PRODUCTS
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. SOURCES
-- Stores provenance for BIS/Government sources.
CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    url TEXT,
    publisher VARCHAR(255),
    retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 3. STANDARDS
CREATE TABLE standards (
    id SERIAL PRIMARY KEY,
    standard_number VARCHAR(100) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    year INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'unknown',
    category VARCHAR(100),
    description TEXT,
    source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. PRODUCT ↔ STANDARD
CREATE TABLE product_standards (
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    standard_id INTEGER NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
    relevance_reason TEXT,
    PRIMARY KEY (product_id, standard_id)
);

-- 5. STANDARD RELATIONSHIPS
CREATE TABLE standard_relations (
    id SERIAL PRIMARY KEY,
    source_standard_id INTEGER NOT NULL
        REFERENCES standards(id) ON DELETE CASCADE,
    target_standard_id INTEGER NOT NULL
        REFERENCES standards(id) ON DELETE CASCADE,
    relation_type VARCHAR(100) NOT NULL,
    description TEXT,
    UNIQUE(source_standard_id, target_standard_id, relation_type)
);

-- 6. CERTIFICATION SCHEMES
CREATE TABLE certification_schemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    scheme_code VARCHAR(100),
    description TEXT,
    source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
    url TEXT
);

-- 7. PRODUCT CERTIFICATION INFORMATION
CREATE TABLE product_certifications (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    standard_id INTEGER REFERENCES standards(id) ON DELETE SET NULL,
    scheme_id INTEGER REFERENCES certification_schemes(id) ON DELETE SET NULL,
    requirement_status VARCHAR(100),
    description TEXT,
    source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL
);

-- 8. LABORATORIES
CREATE TABLE labs (
    id SERIAL PRIMARY KEY,
    lab_code VARCHAR(100),
    lab_name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    contact_person VARCHAR(255),
    contact_number VARCHAR(100),
    email VARCHAR(255),
    validity_date DATE,
    source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. LABORATORY TESTING SCOPES
CREATE TABLE lab_scopes (
    id SERIAL PRIMARY KEY,
    lab_id INTEGER NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
    standard_id INTEGER NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
    scope_description TEXT,
    test_price NUMERIC(12,2),
    validity_date DATE,
    remarks TEXT,
    source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
    UNIQUE(lab_id, standard_id, scope_description)
);

-- 10. DOCUMENTS
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    document_type VARCHAR(100),
    url TEXT,
    source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
    publication_date DATE,
    version VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. DOCUMENT CHUNKS
-- Prepared for RAG retrieval.
CREATE TABLE document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    page_number INTEGER,
    section_title TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, chunk_index)
);

-- 12. EVIDENCE
-- Connects claims/data used in answers to their sources.
CREATE TABLE evidence (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
    document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
    standard_id INTEGER REFERENCES standards(id) ON DELETE SET NULL,
    lab_id INTEGER REFERENCES labs(id) ON DELETE SET NULL,
    evidence_type VARCHAR(100),
    reference_text TEXT,
    page_number INTEGER,
    section_title TEXT,
    url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. USER QUERIES
CREATE TABLE queries (
    id SERIAL PRIMARY KEY,
    query_text TEXT NOT NULL,
    detected_product TEXT,
    detected_category VARCHAR(100),
    response_text TEXT,
    confidence NUMERIC(5,4),
    was_abstained BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_standards_number
    ON standards(standard_number);

CREATE INDEX idx_standards_category
    ON standards(category);

CREATE INDEX idx_standards_status
    ON standards(status);

CREATE INDEX idx_products_category
    ON products(category);

CREATE INDEX idx_labs_name
    ON labs(lab_name);

CREATE INDEX idx_labs_state
    ON labs(state);

CREATE INDEX idx_lab_scopes_standard
    ON lab_scopes(standard_id);

CREATE INDEX idx_document_chunks_document
    ON document_chunks(document_id);

CREATE INDEX idx_document_chunks_metadata
    ON document_chunks USING GIN(metadata);

CREATE INDEX idx_queries_created
    ON queries(created_at);

-- ============================================================
-- COMPLETE
-- ============================================================