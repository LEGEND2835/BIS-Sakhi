BEGIN;

-- ============================================================
-- MOTORCYCLE HELMET — BIS-SAKHI SEED DATA
-- ============================================================

-- ------------------------------------------------------------
-- SOURCES
-- ------------------------------------------------------------

INSERT INTO sources
    (name, source_type, url, publisher)
SELECT
    'BIS IS 4151:2015',
    'BIS Standard',
    'https://www.bis.gov.in/is-4151-2015/',
    'Bureau of Indian Standards'
WHERE NOT EXISTS (
    SELECT 1
    FROM sources
    WHERE name = 'BIS IS 4151:2015'
);

INSERT INTO sources
    (name, source_type, url, publisher)
SELECT
    'BIS LIMS - IS 4151',
    'BIS LIMS',
    'https://lims.bis.gov.in/home/search_is_number/?is_number__doc_no=4151',
    'Bureau of Indian Standards'
WHERE NOT EXISTS (
    SELECT 1
    FROM sources
    WHERE name = 'BIS LIMS - IS 4151'
);

-- ------------------------------------------------------------
-- PRODUCT
-- ------------------------------------------------------------

INSERT INTO products
    (name, category, description, keywords)
SELECT
    'Motorcycle Helmet',
    'Protective Helmets',
    'Protective helmet intended for motorcycle riders.',
    ARRAY[
        'helmet',
        'motorcycle helmet',
        'bike helmet',
        'protective helmet'
    ]
WHERE NOT EXISTS (
    SELECT 1
    FROM products
    WHERE name = 'Motorcycle Helmet'
);

-- ------------------------------------------------------------
-- STANDARDS
-- ------------------------------------------------------------

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
    'IS 4151:2015',
    'Protective helmets for motorcycle riders – Specification (Fourth Revision)',
    2015,
    'active',
    'Protective Helmets',
    'Indian Standard for protective helmets for motorcycle riders.',
    (
        SELECT id
        FROM sources
        WHERE name = 'BIS IS 4151:2015'
        LIMIT 1
    )
),
(
    'IS 4151:1993',
    'Specification for protective helmets for scooter and motorcycle riders',
    1993,
    'withdrawn',
    'Protective Helmets',
    'Withdrawn earlier edition of the motorcycle helmet standard.',
    (
        SELECT id
        FROM sources
        WHERE name = 'BIS IS 4151:2015'
        LIMIT 1
    )
)
ON CONFLICT (standard_number) DO NOTHING;

-- ------------------------------------------------------------
-- PRODUCT → CURRENT STANDARD
-- ------------------------------------------------------------

INSERT INTO product_standards
    (
        product_id,
        standard_id,
        relevance_reason
    )
SELECT
    p.id,
    s.id,
    'Current standard applicable to protective helmets for motorcycle riders.'
FROM products p
CROSS JOIN standards s
WHERE p.name = 'Motorcycle Helmet'
  AND s.standard_number = 'IS 4151:2015'
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- STANDARD RELATION
-- ------------------------------------------------------------

INSERT INTO standard_relations
    (
        source_standard_id,
        target_standard_id,
        relation_type,
        description
    )
SELECT
    old.id,
    current.id,
    'superseded_by',
    'IS 4151:1993 was superseded by IS 4151:2015.'
FROM standards old
CROSS JOIN standards current
WHERE old.standard_number = 'IS 4151:1993'
  AND current.standard_number = 'IS 4151:2015'
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- LABS
-- ------------------------------------------------------------

INSERT INTO labs
    (lab_code, lab_name)
SELECT
    '8176806',
    'PIONEER TESTING LABORATORY PRIVATE LIMITED'
WHERE NOT EXISTS (
    SELECT 1
    FROM labs
    WHERE lab_code = '8176806'
);

INSERT INTO labs
    (lab_code, lab_name)
SELECT
    '8199006',
    'PRESTO LABORATORIES PRIVATE LIMITED'
WHERE NOT EXISTS (
    SELECT 1
    FROM labs
    WHERE lab_code = '8199006'
);

INSERT INTO labs
    (lab_code, lab_name)
SELECT
    '8138306',
    'Testtex India Laboratories Private Limited, Noida'
WHERE NOT EXISTS (
    SELECT 1
    FROM labs
    WHERE lab_code = '8138306'
);

-- ------------------------------------------------------------
-- LAB SCOPES
-- ------------------------------------------------------------

INSERT INTO lab_scopes
    (
        lab_id,
        standard_id,
        scope_description
    )
SELECT
    l.id,
    s.id,
    'BIS LIMS testing scope for IS 4151:2015.'
FROM labs l
CROSS JOIN standards s
WHERE s.standard_number = 'IS 4151:2015'
  AND l.lab_code IN (
      '8176806',
      '8199006',
      '8138306'
  )
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- EVIDENCE
-- ------------------------------------------------------------

INSERT INTO evidence
    (
        source_id,
        standard_id,
        evidence_type,
        reference_text,
        url
    )
SELECT
    src.id,
    s.id,
    'BIS Standard',
    'BIS record for IS 4151:2015.',
    src.url
FROM sources src
JOIN standards s
    ON s.standard_number = 'IS 4151:2015'
WHERE src.name = 'BIS IS 4151:2015'
  AND NOT EXISTS (
      SELECT 1
      FROM evidence e
      WHERE e.standard_id = s.id
        AND e.source_id = src.id
        AND e.evidence_type = 'BIS Standard'
    );

INSERT INTO evidence
    (
        source_id,
        standard_id,
        evidence_type,
        reference_text,
        url
    )
SELECT
    src.id,
    s.id,
    'BIS LIMS',
    'BIS LIMS record for testing laboratories for IS 4151:2015.',
    src.url
FROM sources src
JOIN standards s
    ON s.standard_number = 'IS 4151:2015'
WHERE src.name = 'BIS LIMS - IS 4151'
  AND NOT EXISTS (
      SELECT 1
      FROM evidence e
      WHERE e.standard_id = s.id
        AND e.source_id = src.id
        AND e.evidence_type = 'BIS LIMS'
    );

COMMIT;