-- ============================================================
-- BIS-SAKHI PACKAGED DRINKING WATER SEED
-- Current BIS standard: IS 14543:2024
-- Safe to rerun: idempotent (ON CONFLICT / NOT EXISTS guards).
-- ============================================================

BEGIN;

-- SOURCE
INSERT INTO sources
    (name, source_type, url, publisher, notes)
VALUES
(
    'BIS LIMS - IS 14543',
    'Laboratory Information Management System',
    'https://lims.bis.gov.in/home/search_is_number/?is_number__doc_no=14543',
    'Bureau of Indian Standards',
    'Official BIS LIMS results for IS 14543'
)
ON CONFLICT (name) DO NOTHING;

-- PRODUCT
INSERT INTO products
    (name, category, description, keywords)
VALUES
(
    'Packaged Drinking Water',
    'Packaged Drinking Water',
    'Packaged drinking water other than packaged natural mineral water.', ARRAY['packaged drinking water','drinking water','packaged water','water']
)
ON CONFLICT (name) DO NOTHING;

-- STANDARD
INSERT INTO standards
    (
        standard_number,
        title,
        year,
        status,
        category,
        description,
        source_id
    )
VALUES
(
    'IS 14543:2024',
    'Packaged Drinking Water Other than Packaged Natural Mineral Water — Specification (Third Revision)',
    2024,
    'active',
    'Packaged Drinking Water',
    'Indian Standard for packaged drinking water other than packaged natural mineral water.',
    (
        SELECT id
        FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    )
)
ON CONFLICT (standard_number) DO NOTHING;

-- PRODUCT ↔ STANDARD
INSERT INTO product_standards
    (
        product_id,
        standard_id,
        relevance_reason
    )
VALUES
(
    (
        SELECT id
        FROM products
        WHERE name = 'Packaged Drinking Water'
    ),
    (
        SELECT id
        FROM standards
        WHERE standard_number = 'IS 14543:2024'
    ),
    'BIS LIMS identifies IS 14543:2024 for packaged drinking water other than packaged natural mineral water.'
)
ON CONFLICT DO NOTHING;

-- LABORATORIES
-- Inserted only when not already present, so a rerun (or a shared lab_code
-- inserted by another seed) never creates a duplicate laboratory.

INSERT INTO labs
    (
        lab_code,
        lab_name,
        city,
        state,
        source_id
    )
SELECT
    '5140804',
    'NATIONAL TEST HOUSE-ER (NTH), KOLKATA',
    'Kolkata',
    'West Bengal',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    )
WHERE NOT EXISTS (
    SELECT 1 FROM labs
    WHERE lab_code = '5140804'
);

INSERT INTO labs
    (
        lab_code,
        lab_name,
        city,
        state,
        source_id
    )
SELECT
    '5169204',
    'National Test House (NER) - NTH, Guwahati',
    'Guwahati',
    'Assam',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    )
WHERE NOT EXISTS (
    SELECT 1 FROM labs
    WHERE lab_code = '5169204'
);

INSERT INTO labs
    (
        lab_code,
        lab_name,
        city,
        state,
        source_id
    )
SELECT
    '6164216',
    'Vimta Labs Limited, Bengaluru',
    'Bengaluru',
    'Karnataka',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    )
WHERE NOT EXISTS (
    SELECT 1 FROM labs
    WHERE lab_code = '6164216'
);

-- LAB SCOPES

INSERT INTO lab_scopes
    (
        lab_id,
        standard_id,
        scope_description,
        validity_date,
        source_id
    )
VALUES
(
    (
        SELECT id FROM labs
        WHERE lab_code = '5140804'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 14543:2024'
    ),
    'Packaged Drinking Water Other than Packaged Natural Mineral Water — Specification Third Revision',
    '2027-06-14',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    )
),
(
    (
        SELECT id FROM labs
        WHERE lab_code = '5169204'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 14543:2024'
    ),
    'Packaged Drinking Water Other than Packaged Natural Mineral Water — Specification Third Revision',
    '2027-12-13',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    )
),
(
    (
        SELECT id FROM labs
        WHERE lab_code = '6164216'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 14543:2024'
    ),
    'Packaged Drinking Water Other than Packaged Natural Mineral Water — Specification Third Revision',
    '2027-01-14',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    )
)
ON CONFLICT DO NOTHING;

-- EVIDENCE

INSERT INTO evidence
    (
        source_id,
        standard_id,
        lab_id,
        evidence_type,
        reference_text,
        url
    )
SELECT
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 14543:2024'
    ),
    NULL,
    'standard_identity',
    'BIS LIMS lists IS 14543 (2024) as Packaged Drinking Water Other than Packaged Natural Mineral Water — Specification Third Revision.',
    'https://lims.bis.gov.in/home/search_is_number/?is_number__doc_no=14543'
WHERE NOT EXISTS (
    SELECT 1 FROM evidence e
    WHERE e.source_id = (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    )
      AND e.standard_id = (
        SELECT id FROM standards
        WHERE standard_number = 'IS 14543:2024'
    )
      AND e.lab_id IS NULL
      AND e.evidence_type = 'standard_identity'
);
INSERT INTO evidence
    (
        source_id,
        standard_id,
        lab_id,
        evidence_type,
        reference_text,
        url
    )
SELECT
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 14543:2024'
    ),
    (
        SELECT id FROM labs
        WHERE lab_code = '5140804'
    ),
    'laboratory_scope',
    'BIS LIMS lists National Test House-ER (NTH), Kolkata for IS 14543:2024.',
    'https://lims.bis.gov.in/home/search_is_number/?is_number__doc_no=14543'
WHERE NOT EXISTS (
    SELECT 1 FROM evidence e
    WHERE e.source_id = (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    )
      AND e.standard_id = (
        SELECT id FROM standards
        WHERE standard_number = 'IS 14543:2024'
    )
      AND e.lab_id = (
        SELECT id FROM labs
        WHERE lab_code = '5140804'
    )
      AND e.evidence_type = 'laboratory_scope'
);

INSERT INTO evidence
    (
        source_id,
        standard_id,
        lab_id,
        evidence_type,
        reference_text,
        url
    )
SELECT
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 14543:2024'
    ),
    (
        SELECT id FROM labs
        WHERE lab_code = '5169204'
    ),
    'laboratory_scope',
    'BIS LIMS lists National Test House (NER), Guwahati for IS 14543:2024.',
    'https://lims.bis.gov.in/home/search_is_number/?is_number__doc_no=14543'
WHERE NOT EXISTS (
    SELECT 1 FROM evidence e
    WHERE e.source_id = (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    )
      AND e.standard_id = (
        SELECT id FROM standards
        WHERE standard_number = 'IS 14543:2024'
    )
      AND e.lab_id = (
        SELECT id FROM labs
        WHERE lab_code = '5169204'
    )
      AND e.evidence_type = 'laboratory_scope'
);

INSERT INTO evidence
    (
        source_id,
        standard_id,
        lab_id,
        evidence_type,
        reference_text,
        url
    )
SELECT
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 14543:2024'
    ),
    (
        SELECT id FROM labs
        WHERE lab_code = '6164216'
    ),
    'laboratory_scope',
    'BIS LIMS lists Vimta Labs Limited, Bengaluru for IS 14543:2024.',
    'https://lims.bis.gov.in/home/search_is_number/?is_number__doc_no=14543'
WHERE NOT EXISTS (
    SELECT 1 FROM evidence e
    WHERE e.source_id = (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 14543'
    )
      AND e.standard_id = (
        SELECT id FROM standards
        WHERE standard_number = 'IS 14543:2024'
    )
      AND e.lab_id = (
        SELECT id FROM labs
        WHERE lab_code = '6164216'
    )
      AND e.evidence_type = 'laboratory_scope'
);

COMMIT;
