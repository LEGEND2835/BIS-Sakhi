BEGIN;

-- ============================================================
-- BATTERIES — BIS-SAKHI SEED DATA
-- ============================================================

-- Sources
INSERT INTO sources (name, source_type, url, publisher)
VALUES
(
    'BIS CRS - IS 16046',
    'BIS CRS',
    'https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-ii-registration-scheme/',
    'Bureau of Indian Standards'
),
(
    'BIS LIMS - IS 16046',
    'BIS LIMS',
    'https://lims.bis.gov.in/home/search_is_number/?is_number__doc_no=16046',
    'Bureau of Indian Standards'
)
ON CONFLICT DO NOTHING;

-- Product
INSERT INTO products
    (name, category, description, keywords)
VALUES
(
    'Portable Secondary Batteries',
    'Batteries',
    'Portable sealed secondary cells and batteries covered by IS 16046.',
    ARRAY[
        'battery',
        'batteries',
        'rechargeable battery',
        'rechargeable batteries',
        'portable battery',
        'portable batteries',
        'secondary battery',
        'secondary batteries',
        'lithium battery',
        'lithium ion battery',
        'lithium-ion battery',
        'li ion battery',
        'nickel battery'
    ]
)
ON CONFLICT DO NOTHING;

-- Standards
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
    'IS 16046 (Part 1):2018',
    'Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes — Safety Requirements for Portable Sealed Secondary Cells and for Batteries Made from Them for Use in Portable Applications — Part 1: Nickel Systems',
    2018,
    'active',
    'Batteries',
    'Safety requirements for portable sealed secondary cells and batteries — Nickel Systems.',
    (
        SELECT id
        FROM sources
        WHERE name = 'BIS LIMS - IS 16046'
        LIMIT 1
    )
),
(
    'IS 16046 (Part 2):2018',
    'Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes — Safety Requirements for Portable Sealed Secondary Cells and for Batteries Made from Them for Use in Portable Applications — Part 2: Lithium Systems',
    2018,
    'active',
    'Batteries',
    'Safety requirements for portable sealed secondary cells and batteries — Lithium Systems.',
    (
        SELECT id
        FROM sources
        WHERE name = 'BIS LIMS - IS 16046'
        LIMIT 1
    )
)
ON CONFLICT (standard_number) DO NOTHING;

-- Product → Standards
INSERT INTO product_standards
    (product_id, standard_id, relevance_reason)
SELECT
    p.id,
    s.id,
    CASE
        WHEN s.standard_number = 'IS 16046 (Part 1):2018'
            THEN 'Applicable to portable secondary batteries using Nickel Systems.'
        WHEN s.standard_number = 'IS 16046 (Part 2):2018'
            THEN 'Applicable to portable secondary batteries using Lithium Systems.'
    END
FROM products p
CROSS JOIN standards s
WHERE p.name = 'Portable Secondary Batteries'
  AND s.standard_number IN (
      'IS 16046 (Part 1):2018',
      'IS 16046 (Part 2):2018'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- LABS — PART 1: NICKEL SYSTEMS
-- ============================================================

INSERT INTO labs
    (lab_code, lab_name, city, state)
VALUES
(
    '6120526',
    'UL INDIA PRIVATE LIMITED',
    'Bengaluru',
    'Karnataka'
),
(
    '8185306',
    'ALPHA TEST HOUSE PVT LTD',
    'Bahadurgarh',
    'Haryana'
),
(
    '8165826',
    'AA Electro Magnetic Laboratory Pvt Ltd',
    'Gurugram',
    'Haryana'
)
ON CONFLICT DO NOTHING;

-- Lab scopes — Part 1
INSERT INTO lab_scopes
    (lab_id, standard_id, scope_description)
SELECT
    l.id,
    s.id,
    'BIS LIMS testing scope for IS 16046 Part 1:2018 — Nickel Systems'
FROM labs l
CROSS JOIN standards s
WHERE s.standard_number = 'IS 16046 (Part 1):2018'
  AND l.lab_code IN (
      '6120526',
      '8185306',
      '8165826'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- LABS — PART 2: LITHIUM SYSTEMS
-- ============================================================

INSERT INTO labs
    (lab_code, lab_name, city, state)
VALUES
(
    '6178726',
    'Standard Testing and Compliance Private Limited',
    NULL,
    NULL
),
(
    '8138626',
    'Matrix Test Labs',
    NULL,
    NULL
),
(
    '8168906',
    'URS PRODUCTS AND TESTING PVT. LTD. (A29)',
    'Noida',
    'Uttar Pradesh'
)
ON CONFLICT DO NOTHING;

-- Lab scopes — Part 2
INSERT INTO lab_scopes
    (lab_id, standard_id, scope_description)
SELECT
    l.id,
    s.id,
    'BIS LIMS testing scope for IS 16046 Part 2:2018 — Lithium Systems'
FROM labs l
CROSS JOIN standards s
WHERE s.standard_number = 'IS 16046 (Part 2):2018'
  AND l.lab_code IN (
      '6178726',
      '8138626',
      '8168906'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- EVIDENCE
-- ============================================================

INSERT INTO evidence
    (source_id, standard_id, evidence_type, reference_text, url)
SELECT
    src.id,
    s.id,
    'BIS LIMS',
    'BIS LIMS record for IS 16046 testing scope.',
    src.url
FROM sources src
JOIN standards s
    ON s.standard_number IN (
        'IS 16046 (Part 1):2018',
        'IS 16046 (Part 2):2018'
    )
WHERE src.name = 'BIS LIMS - IS 16046';

COMMIT;