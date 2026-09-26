-- ============================================================
-- BIS-SAKHI TOYS SEED DATA
-- Verified against BIS / BIS LIMS
-- ============================================================

-- SOURCE
INSERT INTO sources
    (name, source_type, url, publisher, notes)
VALUES
(
    'BIS Toys Certification',
    'BIS Product Certification',
    'https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-i-mark-scheme/',
    'Bureau of Indian Standards',
    'Official BIS compulsory certification information for toys.'
),
(
    'BIS LIMS - IS 9873',
    'Laboratory Information Management System',
    'https://lims.bis.gov.in/home/search_is_number/?is_number__doc_no=9873',
    'Bureau of Indian Standards',
    'Official BIS LIMS results for IS 9873.'
),
(
    'BIS LIMS - IS 15644',
    'Laboratory Information Management System',
    'https://lims.bis.gov.in/home/search_is_number/?is_number__doc_no=15644',
    'Bureau of Indian Standards',
    'Official BIS LIMS results for IS 15644.'
);

-- PRODUCT
INSERT INTO products
    (name, category, description, keywords)
VALUES
(
    'Toys',
    'Toys',
    'Toys covered by BIS safety requirements, including non-electric and electric toys.',
    ARRAY[
        'toy',
        'toys',
        'children toy',
        'childrens toy',
        'kids toy',
        'kids toys',
        'baby toy',
        'baby toys'
    ]
);

-- STANDARDS
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
    'IS 9873 (Part 1):2025',
    'Safety of Toys Part 1: Safety Aspects Related to Mechanical and Physical Properties (Fifth Revision)',
    2025,
    'active',
    'Toys',
    'Primary safety standard for non-electric toys.',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 9873'
    )
),
(
    'IS 15644:2006',
    'Safety of Electric Toys',
    2006,
    'active',
    'Toys',
    'Primary standard for electric toys.',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 15644'
    )
);

-- PRODUCT ↔ STANDARD

INSERT INTO product_standards
    (product_id, standard_id, relevance_reason)
VALUES
(
    (
        SELECT id FROM products
        WHERE name = 'Toys'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 9873 (Part 1):2025'
    ),
    'Primary standard pathway for non-electric toys.'
),
(
    (
        SELECT id FROM products
        WHERE name = 'Toys'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 15644:2006'
    ),
    'Primary standard pathway for electric toys.'
);

-- LABORATORIES FOR NON-ELECTRIC TOYS

INSERT INTO labs
    (lab_code, lab_name, city, state, source_id)
VALUES
(
    '7174106',
    'Precision Laboratories LLP',
    'Ahmedabad',
    'Gujarat',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 9873'
    )
),
(
    NULL,
    'BIS, Western Regional Laboratory (WRL)',
    NULL,
    NULL,
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 9873'
    )
),
(
    NULL,
    'BIS, Central Laboratory (CL)',
    NULL,
    NULL,
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 9873'
    )
);

-- LAB SCOPES FOR IS 9873 PART 1

INSERT INTO lab_scopes
    (lab_id, standard_id, scope_description, validity_date, source_id)
VALUES
(
    (
        SELECT id FROM labs
        WHERE lab_code = '7174106'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 9873 (Part 1):2025'
    ),
    'Safety of Toys Part 1: Safety Aspects Related to Mechanical and Physical Properties (Fifth Revision)',
    '2029-10-31',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 9873'
    )
),
(
    (
        SELECT id FROM labs
        WHERE lab_name = 'BIS, Western Regional Laboratory (WRL)'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 9873 (Part 1):2025'
    ),
    'Complete testing facility with specified exclusions shown in BIS LIMS.',
    NULL,
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 9873'
    )
),
(
    (
        SELECT id FROM labs
        WHERE lab_name = 'BIS, Central Laboratory (CL)'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 9873 (Part 1):2025'
    ),
    'Testing scope listed by BIS LIMS.',
    NULL,
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 9873'
    )
);

-- LABORATORIES FOR ELECTRIC TOYS

INSERT INTO labs
    (lab_code, lab_name, city, state, source_id)
VALUES
(
    '8168906',
    'URS PRODUCTS AND TESTING PVT. LTD. (A29), NOIDA',
    'Noida',
    'Uttar Pradesh',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 15644'
    )
),
(
    '8185306',
    'ALPHA TEST HOUSE PVT LTD, BAHADURGARH',
    'Bahadurgarh',
    'Haryana',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 15644'
    )
),
(
    '8138306',
    'Testtex India Laboratories Private Limited, Noida',
    'Noida',
    'Uttar Pradesh',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 15644'
    )
);

-- LAB SCOPES FOR ELECTRIC TOYS

INSERT INTO lab_scopes
    (lab_id, standard_id, scope_description, validity_date, source_id)
VALUES
(
    (
        SELECT id FROM labs
        WHERE lab_code = '8168906'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 15644:2006'
    ),
    'Safety of electric toys - all',
    NULL,
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 15644'
    )
),
(
    (
        SELECT id FROM labs
        WHERE lab_code = '8185306'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 15644:2006'
    ),
    'Safety of electric toys - all',
    '2028-05-08',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 15644'
    )
),
(
    (
        SELECT id FROM labs
        WHERE lab_code = '8138306'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 15644:2006'
    ),
    'Safety of electric toys - all',
    '2029-12-31',
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 15644'
    )
);

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
VALUES
(
    (
        SELECT id FROM sources
        WHERE name = 'BIS Toys Certification'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 9873 (Part 1):2025'
    ),
    NULL,
    'certification_standard',
    'BIS lists toys under compulsory certification and identifies the IS 9873 series for non-electric toys.',
    'https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-i-mark-scheme/'
),
(
    (
        SELECT id FROM sources
        WHERE name = 'BIS Toys Certification'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 15644:2006'
    ),
    NULL,
    'certification_standard',
    'BIS lists IS 15644:2006 for safety of electric toys under compulsory certification.',
    'https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-i-mark-scheme/'
),
(
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 9873'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 9873 (Part 1):2025'
    ),
    (
        SELECT id FROM labs
        WHERE lab_code = '7174106'
    ),
    'laboratory_scope',
    'BIS LIMS lists Precision Laboratories LLP, Ahmedabad for IS 9873 Part 1:2025.',
    'https://lims.bis.gov.in/home/search_is_number/?is_number__doc_no=9873'
),
(
    (
        SELECT id FROM sources
        WHERE name = 'BIS LIMS - IS 15644'
    ),
    (
        SELECT id FROM standards
        WHERE standard_number = 'IS 15644:2006'
    ),
    (
        SELECT id FROM labs
        WHERE lab_code = '8168906'
    ),
    'laboratory_scope',
    'BIS LIMS lists URS Products and Testing Pvt. Ltd., Noida for IS 15644:2006.',
    'https://lims.bis.gov.in/home/search_is_number/?is_number__doc_no=15644'
);