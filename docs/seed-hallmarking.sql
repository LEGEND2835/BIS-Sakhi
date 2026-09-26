BEGIN;

-- ============================================================
-- BIS-SAKHI — Hallmarking Knowledge Seed
-- Official BIS sources
-- ============================================================

-- ------------------------------------------------------------
-- 1. Add verified BIS hallmarking sources
-- ------------------------------------------------------------

INSERT INTO sources
    (name, source_type, url, publisher, notes)
VALUES
(
    'BIS Hallmarking Overview',
    'hallmark_info',
    'https://www.bis.gov.in/hallmarking-overview/?lang=en',
    'BIS',
    'Definition of hallmarking and metals currently covered.'
),
(
    'BIS Hallmarking FAQ',
    'hallmark_info',
    'https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/?lang=en',
    'BIS',
    'HUID, silver fineness and consumer hallmarking information.'
),
(
    'BIS Hallmarking Consumer Protection',
    'hallmark_info',
    'https://www.bis.gov.in/hallmarking-overview/consumer-protection/?lang=en',
    'BIS',
    'Consumer jewellery testing and assay report information.'
),
(
    'BIS Hallmarking Jewellers FAQ',
    'hallmark_info',
    'https://www.bis.gov.in/hallmarking-jewellers/?lang=en',
    'BIS',
    'Jeweller registration, hallmark marks and HUID invoice information.'
),
(
    'BIS Care App',
    'hallmark_info',
    'https://www.bis.gov.in/bis-apps/?lang=en',
    'BIS',
    'Verify HUID and other consumer verification services.'
),
(
    'BIS Assaying and Hallmarking Centre FAQ',
    'hallmark_info',
    'https://www.bis.gov.in/a-h-centre/?lang=en',
    'BIS',
    'Information about Assaying and Hallmarking Centres.'
),
(
    'BIS Consumer Protection',
    'hallmark_info',
    'https://www.bis.gov.in/consumer-overview/consumer-overviews/consumer-protection/?lang=en',
    'BIS',
    'Consumer complaint channels.'
),
(
    'BIS Product Certification FAQ',
    'certification',
    'https://www.bis.gov.in/product-certification/product-certification-faq/',
    'BIS',
    'ISI Mark verification information.'
)
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------
-- 2. Hallmarking guidance table
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hallmarking_guidance (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(100) NOT NULL,
    question_pattern TEXT NOT NULL,
    answer TEXT NOT NULL,
    source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------------------------
-- 3. Hallmarking
-- ------------------------------------------------------------

INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'hallmarking',
    'What is hallmarking?;What does hallmarking mean?',
    'Hallmarking is the accurate determination and official recording of the proportionate content of precious metal in precious-metal articles.',
    id
FROM sources
WHERE name = 'BIS Hallmarking Overview'
LIMIT 1;


INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'metals',
    'Which metals are covered by hallmarking?;Is silver covered by hallmarking?;Is gold covered by hallmarking?',
    'BIS states that gold and silver are the two precious metals currently brought under the purview of hallmarking in India. The current mandatory or voluntary status for a particular metal or district should be verified against the latest BIS notification before giving a regulatory conclusion.',
    id
FROM sources
WHERE name = 'BIS Hallmarking Overview'
LIMIT 1;


-- ------------------------------------------------------------
-- 4. HUID
-- ------------------------------------------------------------

INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'huid',
    'What is HUID?;What is a Hallmark Unique Identification number?',
    'HUID stands for Hallmark Unique Identification. It is a six-digit alphanumeric number that is unique and traceable for each hallmarked item. HUID became part of the hallmark from 1 July 2021.',
    id
FROM sources
WHERE name = 'BIS Hallmarking FAQ'
LIMIT 1;


INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'huid',
    'What marks are present on hallmarked gold jewellery?;What are the three hallmark marks?',
    'Since 1 July 2021, the hallmark on gold jewellery consists of the BIS Standard Mark or logo, the purity expressed in caratage and fineness, and the six-digit HUID.',
    id
FROM sources
WHERE name = 'BIS Hallmarking FAQ'
LIMIT 1;


INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'huid_verification',
    'How do I verify HUID?;How can I check my HUID?',
    'Consumers can use the Verify HUID feature in the BIS Care App to verify a HUID. The verification also provides the jeweller or manufacturer registration number.',
    id
FROM sources
WHERE name = 'BIS Care App'
LIMIT 1;


-- ------------------------------------------------------------
-- 5. Consumer jewellery testing
-- ------------------------------------------------------------

INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'consumer_testing',
    'Can I get my jewellery tested?;Where can I test my jewellery?;How can I check jewellery purity?',
    'A consumer can get jewellery or a sample tested at a BIS-recognized Assaying & Hallmarking Centre on a chargeable basis. The centre issues an Assay Report with identification of the article.',
    id
FROM sources
WHERE name = 'BIS Hallmarking Consumer Protection'
LIMIT 1;


-- ------------------------------------------------------------
-- 6. Consumer complaints
-- ------------------------------------------------------------

INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'consumer_complaint',
    'How do I complain about a jeweller?;How do I file a BIS complaint?;How can I complain about a BIS product?',
    'Consumer complaints can be lodged through the BIS CARE app, the Standards Promotion Portal, the Public Grievance Officer at the nearest BIS Regional or Branch Office, or by email to complaints@bis.gov.in.',
    id
FROM sources
WHERE name = 'BIS Consumer Protection'
LIMIT 1;


-- ------------------------------------------------------------
-- 7. ISI Mark verification
-- ------------------------------------------------------------

INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'isi_verification',
    'How do I verify an ISI mark?;Is this ISI mark genuine?',
    'To check an ISI mark, check the IS number displayed above the mark and the licence number on the product or packaging. The licence number can be verified through BIS product-certification services.',
    id
FROM sources
WHERE name = 'BIS Product Certification FAQ'
LIMIT 1;


-- ------------------------------------------------------------
-- 8. CRS verification
-- ------------------------------------------------------------

INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'crs_verification',
    'How do I verify an R-number?;How do I verify a CRS product?',
    'The BIS Care App provides a Verify R-Number under CRS feature. A valid eight-digit R-number can be checked to verify the registration and applicable Indian Standard.',
    id
FROM sources
WHERE name = 'BIS Care App'
LIMIT 1;


-- ------------------------------------------------------------
-- 9. Silver fineness
-- ------------------------------------------------------------

INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'silver_fineness',
    'What are the silver hallmarking fineness grades?;What silver purity grades are covered?',
    'The BIS Hallmarking FAQ states that IS 2112:2014 permits hallmarking of silver jewellery and artefacts at fineness levels of 800, 835, 900, 925, 970 and 990 parts per thousand.',
    id
FROM sources
WHERE name = 'BIS Hallmarking FAQ'
LIMIT 1;


-- ------------------------------------------------------------
-- 10. Purity shortfall
-- ------------------------------------------------------------

INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'purity_compensation',
    'What happens if hallmarked jewellery has lower purity?;What compensation do I get for purity shortfall?',
    'BIS states that under Section 49 of the BIS Rules, 2018, where a precious-metal article does not conform to the relevant standard, compensation can be two times the value of the purity shortfall calculated on weight, in addition to testing charges.',
    id
FROM sources
WHERE name = 'BIS Hallmarking FAQ'
LIMIT 1;


-- ------------------------------------------------------------
-- 11. Jeweller registration
-- ------------------------------------------------------------

INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'jeweller_registration',
    'Does a jeweller need BIS registration?;Does my jeweller need BIS registration?',
    'A jeweller must obtain BIS registration for each sales-outlet premises. A separate registration is required where the jeweller also wants to sell hallmarked silver.',
    id
FROM sources
WHERE name = 'BIS Hallmarking Jewellers FAQ'
LIMIT 1;


-- ------------------------------------------------------------
-- 12. HUID on invoice
-- ------------------------------------------------------------

INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'huid_invoice',
    'Does HUID have to be on the invoice?;Is HUID mandatory on invoice?',
    'BIS states that mentioning the HUID number on invoices is currently voluntary rather than mandatory.',
    id
FROM sources
WHERE name = 'BIS Hallmarking Jewellers FAQ'
LIMIT 1;


-- ------------------------------------------------------------
-- 13. Bullion
-- ------------------------------------------------------------

INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'bullion',
    'What is bullion hallmarking?;Can bullion be hallmarked?',
    'Hallmarking of bullion, as distinct from finished jewellery, is carried out on a voluntary basis by BIS-licensed refineries.',
    id
FROM sources
WHERE name = 'BIS Assaying and Hallmarking Centre FAQ'
LIMIT 1;

-- ------------------------------------------------------------
-- 14. Jeweller registration procedure
-- ------------------------------------------------------------

INSERT INTO sources
    (name, source_type, url, publisher, notes)
VALUES
(
    'BIS Jeweller Registration Procedure',
    'hallmark_info',
    'https://www.bis.gov.in/hallmarking-overview/jewellers-registration-scheme/procedure-of-obtaining-licence/?lang=en',
    'BIS',
    'Official BIS procedure page for obtaining jeweller hallmarking registration.'
)
ON CONFLICT DO NOTHING;


INSERT INTO hallmarking_guidance
    (topic, question_pattern, answer, source_id)
SELECT
    'jeweller_registration_procedure',
    'How do I get a new BIS hallmarking registration?;How can I obtain BIS hallmarking registration?;How do I register as a jeweller with BIS?;How can a jeweller get BIS registration?',
    'For jeweller hallmarking registration, follow the official BIS procedure for obtaining a licence/registration. The current procedure should be followed from the BIS jeweller registration page because registration requirements and procedures can be updated.',
    id
FROM sources
WHERE name = 'BIS Jeweller Registration Procedure'
LIMIT 1;

COMMIT;