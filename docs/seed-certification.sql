BEGIN;

-- ============================================================
-- BIS-SAKHI — CERTIFICATION / SCHEME SEED
-- ============================================================

-- ============================================================
-- SOURCES
-- ============================================================

INSERT INTO sources
    (name, source_type, url, publisher)
SELECT
    'BIS Scheme-I - ISI Mark Scheme',
    'BIS Certification Scheme',
    'https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-i-mark-scheme/?lang=en',
    'Bureau of Indian Standards'
WHERE NOT EXISTS (
    SELECT 1 FROM sources
    WHERE name = 'BIS Scheme-I - ISI Mark Scheme'
);

INSERT INTO sources
    (name, source_type, url, publisher)
SELECT
    'BIS Scheme-II - Registration Scheme',
    'BIS Certification Scheme',
    'https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-ii-registration-scheme/?lang=en',
    'Bureau of Indian Standards'
WHERE NOT EXISTS (
    SELECT 1 FROM sources
    WHERE name = 'BIS Scheme-II - Registration Scheme'
);

INSERT INTO sources
    (name, source_type, url, publisher)
SELECT
    'Helmet QCO 2020',
    'Quality Control Order',
    'https://www.bis.gov.in/wp-content/uploads/2020/12/Helmet-for-riders-of-Two-Wheeler-Motor-Vehicles-Quality-Control-Order-2020.pdf',
    'Ministry of Road Transport and Highways'
WHERE NOT EXISTS (
    SELECT 1 FROM sources
    WHERE name = 'Helmet QCO 2020'
);

INSERT INTO sources
    (name, source_type, url, publisher)
SELECT
    'BIS Toys Certification Guidance',
    'BIS Certification Guidance',
    'https://www.bis.gov.in/wp-content/uploads/2020/10/Website-Banner-Text-for-Toys-Final.pdf',
    'Bureau of Indian Standards'
WHERE NOT EXISTS (
    SELECT 1 FROM sources
    WHERE name = 'BIS Toys Certification Guidance'
);

INSERT INTO sources
    (name, source_type, url, publisher)
SELECT
    'BIS Packaged Drinking Water Product Manual 2025',
    'BIS Product Manual',
    'https://www.bis.gov.in/wp-content/uploads/2025/07/PM-14543-July-2025-Rev.pdf',
    'Bureau of Indian Standards'
WHERE NOT EXISTS (
    SELECT 1 FROM sources
    WHERE name = 'BIS Packaged Drinking Water Product Manual 2025'
);

-- ============================================================
-- CERTIFICATION SCHEMES
-- ============================================================

INSERT INTO certification_schemes
    (name, scheme_code, description, source_id, url)
SELECT
    'Scheme-I (ISI Mark Scheme)',
    'Scheme-I',
    'BIS product certification scheme under which the Standard Mark is used on certified products.',
    id,
    url
FROM sources
WHERE name = 'BIS Scheme-I - ISI Mark Scheme'
  AND NOT EXISTS (
      SELECT 1
      FROM certification_schemes
      WHERE scheme_code = 'Scheme-I'
  );

INSERT INTO certification_schemes
    (name, scheme_code, description, source_id, url)
SELECT
    'Scheme-II (Registration Scheme / CRS)',
    'Scheme-II',
    'BIS registration scheme used for notified products under the Compulsory Registration Scheme.',
    id,
    url
FROM sources
WHERE name = 'BIS Scheme-II - Registration Scheme'
  AND NOT EXISTS (
      SELECT 1
      FROM certification_schemes
      WHERE scheme_code = 'Scheme-II'
  );

-- ============================================================
-- MOTORCYCLE HELMET
-- IS 4151:2015 → SCHEME-I
-- ============================================================

INSERT INTO product_certifications
    (
        product_id,
        standard_id,
        scheme_id,
        requirement_status,
        description,
        source_id
    )
SELECT
    p.id,
    s.id,
    cs.id,
    'mandatory',
    'Helmet for riders of two-wheeler motor vehicles is subject to compulsory BIS certification under the Helmet QCO and Scheme-I. The QCO specifies IS 4151:2015.',
    src.id
FROM products p
JOIN standards s
    ON s.standard_number = 'IS 4151:2015'
JOIN certification_schemes cs
    ON cs.scheme_code = 'Scheme-I'
JOIN sources src
    ON src.name = 'Helmet QCO 2020'
WHERE p.name = 'Motorcycle Helmet'
  AND NOT EXISTS (
      SELECT 1
      FROM product_certifications pc
      WHERE pc.product_id = p.id
        AND pc.standard_id = s.id
        AND pc.scheme_id = cs.id
  );

-- ============================================================
-- TOYS
-- IS 15644:2006 → SCHEME-I
-- ============================================================

INSERT INTO product_certifications
    (
        product_id,
        standard_id,
        scheme_id,
        requirement_status,
        description,
        source_id
    )
SELECT
    p.id,
    s.id,
    cs.id,
    'mandatory',
    'Electric toys are covered by compulsory BIS certification under Scheme-I. IS 15644:2006 is the primary standard for electric toys.',
    src.id
FROM products p
JOIN standards s
    ON s.standard_number = 'IS 15644:2006'
JOIN certification_schemes cs
    ON cs.scheme_code = 'Scheme-I'
JOIN sources src
    ON src.name = 'BIS Toys Certification Guidance'
WHERE p.name = 'Toys'
  AND NOT EXISTS (
      SELECT 1
      FROM product_certifications pc
      WHERE pc.product_id = p.id
        AND pc.standard_id = s.id
        AND pc.scheme_id = cs.id
  );

-- ============================================================
-- TOYS
-- IS 9873 Part 1:2025
--
-- IMPORTANT:
-- Current Scheme-I listing references IS 9873 Part 1:2018,
-- while our LIMS dataset contains a 2025 record.
-- Therefore we do NOT claim that the 2025 revision itself
-- is the certification revision without further verification.
-- ============================================================

INSERT INTO product_certifications
    (
        product_id,
        standard_id,
        scheme_id,
        requirement_status,
        description,
        source_id
    )
SELECT
    p.id,
    s.id,
    cs.id,
    'mandatory - revision verification required',
    'Non-electric toys are covered by compulsory BIS certification under Scheme-I. The current BIS Scheme-I listing references IS 9873 Part 1:2018, while BIS LIMS contains a current 2025 testing record. Verify the applicable certification revision before relying on this record.',
    src.id
FROM products p
JOIN standards s
    ON s.standard_number = 'IS 9873 (Part 1):2025'
JOIN certification_schemes cs
    ON cs.scheme_code = 'Scheme-I'
JOIN sources src
    ON src.name = 'BIS Toys Certification Guidance'
WHERE p.name = 'Toys'
  AND NOT EXISTS (
      SELECT 1
      FROM product_certifications pc
      WHERE pc.product_id = p.id
        AND pc.standard_id = s.id
        AND pc.scheme_id = cs.id
  );

-- ============================================================
-- BATTERIES
-- IS 16046 Part 1:2018 → SCHEME-II / CRS
-- ============================================================

INSERT INTO product_certifications
    (
        product_id,
        standard_id,
        scheme_id,
        requirement_status,
        description,
        source_id
    )
SELECT
    p.id,
    s.id,
    cs.id,
    'mandatory',
    'Portable sealed secondary cells and batteries covered by IS 16046 are listed under the BIS Compulsory Registration Scheme (Scheme-II).',
    src.id
FROM products p
JOIN standards s
    ON s.standard_number = 'IS 16046 (Part 1):2018'
JOIN certification_schemes cs
    ON cs.scheme_code = 'Scheme-II'
JOIN sources src
    ON src.name = 'BIS Scheme-II - Registration Scheme'
WHERE p.name = 'Portable Secondary Batteries'
  AND NOT EXISTS (
      SELECT 1
      FROM product_certifications pc
      WHERE pc.product_id = p.id
        AND pc.standard_id = s.id
        AND pc.scheme_id = cs.id
  );

-- ============================================================
-- BATTERIES
-- IS 16046 Part 2:2018 → SCHEME-II / CRS
-- ============================================================

INSERT INTO product_certifications
    (
        product_id,
        standard_id,
        scheme_id,
        requirement_status,
        description,
        source_id
    )
SELECT
    p.id,
    s.id,
    cs.id,
    'mandatory',
    'Portable sealed secondary cells and batteries covered by IS 16046 are listed under the BIS Compulsory Registration Scheme (Scheme-II).',
    src.id
FROM products p
JOIN standards s
    ON s.standard_number = 'IS 16046 (Part 2):2018'
JOIN certification_schemes cs
    ON cs.scheme_code = 'Scheme-II'
JOIN sources src
    ON src.name = 'BIS Scheme-II - Registration Scheme'
WHERE p.name = 'Portable Secondary Batteries'
  AND NOT EXISTS (
      SELECT 1
      FROM product_certifications pc
      WHERE pc.product_id = p.id
        AND pc.standard_id = s.id
        AND pc.scheme_id = cs.id
  );

-- ============================================================
-- PACKAGED DRINKING WATER
-- IS 14543:2024
--
-- Current BIS compulsory-certification page marks IS 14543
-- as de-notified from compulsory BIS certification.
-- BIS nevertheless maintains a Scheme-I Product Manual.
-- ============================================================

INSERT INTO product_certifications
    (
        product_id,
        standard_id,
        scheme_id,
        requirement_status,
        description,
        source_id
    )
SELECT
    p.id,
    s.id,
    cs.id,
    'de-notified from compulsory certification',
    'IS 14543:2024 has a BIS Product Manual for certification under Scheme-I, but the current BIS compulsory-certification listing marks IS 14543 as de-notified from compulsory BIS certification. Do not present BIS certification as currently mandatory based on this record.',
    src.id
FROM products p
JOIN standards s
    ON s.standard_number = 'IS 14543:2024'
JOIN certification_schemes cs
    ON cs.scheme_code = 'Scheme-I'
JOIN sources src
    ON src.name = 'BIS Packaged Drinking Water Product Manual 2025'
WHERE p.name = 'Packaged Drinking Water'
  AND NOT EXISTS (
      SELECT 1
      FROM product_certifications pc
      WHERE pc.product_id = p.id
        AND pc.standard_id = s.id
        AND pc.scheme_id = cs.id
  );

COMMIT;