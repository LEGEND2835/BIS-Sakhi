# BIS-SAKHI — Product Requirements Document (PRD)

**Project:** BIS-SAKHI  
**SIH 2026 Problem Statement:** SIH26107  
**Problem Statement:** AI-powered intelligent assistant for Indian Standards and BIS Services  
**Team:** BHARAT NEXUS  
**Version:** 1.0  
**Status:** MVP Development

## 1. Product Overview

BIS-SAKHI is a source-grounded AI assistant designed to help users understand Indian Standards and BIS services through natural-language interaction.

Instead of requiring users to search across multiple BIS portals, standards catalogues, certification information, laboratory information and procedural documents, BIS-SAKHI provides a conversational interface that retrieves relevant verified information and presents it with supporting sources.

The central product feature is the **BIS Compliance Pathway**:

**Product / Query → Applicable Standard → Certification → Testing Requirements → Relevant Laboratory → Next Steps**

The MVP will focus on a small, carefully verified BIS knowledge base rather than attempting to cover the entire BIS catalogue.

## 2. Problem Statement

Users seeking BIS information may need to determine:
- Which Indian Standard applies to a product.
- Whether certification information is relevant.
- Which certification scheme or process may apply.
- What testing information is relevant.
- Which laboratories have a relevant testing scope.
- Whether a standard is current, revised or withdrawn.
- Where supporting information comes from.

Relevant information is distributed across BIS services and documents. Conventional keyword search may also fail to understand natural-language product descriptions or connect related information across standards, certification and laboratory services.

## 3. Product Vision

> **Describe what you are making or ask what you need to know, and BIS-SAKHI helps identify relevant BIS standards, certification information, testing options and next steps — with evidence.**

## 4. Target Users

### Primary
- Product manufacturers
- Small and medium enterprises
- Procurement and technical personnel
- Businesses seeking BIS-related compliance information

### Secondary
- Consumers seeking BIS information
- Students/researchers
- Users navigating BIS services

## 5. MVP Goals

1. Provide natural-language access to selected BIS knowledge.
2. Recommend relevant Indian Standards from product descriptions and questions.
3. Distinguish current and withdrawn/revised standards where verified.
4. Connect standards with relevant certification information.
5. Connect standards with relevant testing laboratories and scopes.
6. Provide source-backed responses.
7. Generate an explainable BIS Compliance Pathway.
8. Safely abstain when evidence is insufficient.
9. Provide a foundation for multilingual interaction.
10. Maintain provenance for BIS-related information.

## 6. Non-Goals for MVP

The MVP will not attempt to:
- Reproduce the entire BIS standards catalogue.
- Scrape thousands of full Indian Standard documents.
- Replace BIS officials, certification authorities or laboratories.
- Provide legally binding compliance decisions.
- Guarantee certification eligibility.
- Invent missing BIS information.
- Make unsupported clause-level claims.
- Build a production-scale enterprise knowledge platform.

## 7. Core Features

### 7.1 Natural-Language BIS Assistant
Users can ask questions in ordinary language. The system identifies the likely product/domain and retrieves relevant verified information.

### 7.2 Standard Recommendation
Recommend relevant standards based on product descriptions, technical terminology, user questions, retrieved BIS documents, and standard metadata/relationships. Explain why a standard was considered relevant.

### 7.3 Standard Status Awareness
Support verified status such as current, withdrawn, revised or superseded. Never infer current status without evidence.

### 7.4 Certification Guidance
Where verified information exists, explain relevant certification schemes, processes and product-specific information.

### 7.5 Testing Laboratory Discovery
Connect an applicable standard to laboratories whose available BIS LIMS information indicates a relevant testing scope.

### 7.6 Source-Grounded Responses
BIS-related factual claims should be backed by source metadata such as source name, document name, official URL, and page/section where available.

### 7.7 BIS Compliance Pathway
The primary differentiating feature:

```text
User Product / Query
        ↓
Product & Intent Understanding
        ↓
Applicable Indian Standards
        ↓
Certification Information
        ↓
Testing Requirements
        ↓
Relevant Testing Laboratories
        ↓
Documents / Procedure Information
        ↓
Recommended Next Steps
```

### 7.8 Multilingual Interaction
The architecture should support multilingual questions and responses without requiring a redesign of the core knowledge model.

### 7.9 Confidence and Safe Abstention
When evidence is insufficient, the system must clearly say so rather than hallucinating.

## 8. MVP Knowledge Scope

Initial domains:
1. Protective helmets
2. Packaged drinking water
3. Toys
4. Batteries/electronics

The initial corpus should prioritize approximately 20 verified standards plus supporting BIS sources.

Source categories include:
- BIS Know Your Standards
- BIS Product Manuals / STIs
- BIS Product Certification information
- BIS Compulsory Registration Scheme information
- BIS LIMS laboratory information
- BIS Hallmarking information
- BIS Care information
- Relevant BIS procedures and official documents

Only appropriately verified information should enter the core knowledge base.

## 9. Demo Scenarios

### Scenario 1 — Motorcycle Helmet
**User:** “I manufacture motorcycle helmets. What BIS standard applies and where can I get it tested?”

Expected pathway:
- Product: Motorcycle helmet
- Applicable standard: IS 4151:2015
- Certification information: relevant verified BIS information
- Testing: relevant laboratories with available scope information
- Sources: official BIS evidence
- Next steps: concise compliance-oriented guidance

### Scenario 2 — Withdrawn Standard
**User:** “I found IS 4151:1993. Can I use this standard for motorcycle helmets?”

Expected behavior:
- Identify the verified withdrawn status.
- Identify newer/currently published standard information available in the knowledge base.
- Cite the supporting source.
- Avoid unsupported legal/compliance determinations.

### Scenario 3 — Packaged Drinking Water
**User:** “What BIS standard applies to packaged drinking water?”

Expected behavior:
- Retrieve relevant verified standards.
- Explain relevant product-category distinctions when supported.
- Provide certification/procedure information where verified.
- Cite sources.

### Scenario 4 — Out-of-Corpus Query
If a product is outside the verified knowledge base, do not hallucinate. State that verified information is unavailable and provide an appropriate official BIS path where possible.

## 10. Data Architecture

Planned MVP tables:
- `sources`
- `standards`
- `standard_relations`
- `certification_schemes`
- `product_certifications`
- `labs`
- `lab_scopes`
- `documents`
- `document_chunks`
- `queries`

Core relationships:

```text
Source
  ↓
Document
  ↓
Document Chunk
  ↓
RAG Evidence

Standard
  ↓
Standard Relations
  ↓
Certification / Product Information
  ↓
Lab Scope
  ↓
Laboratory
```

The database should preserve provenance and support future semantic/vector retrieval.

## 11. RAG Architecture

```text
User Query
    ↓
Query Understanding
    ↓
Structured Database Retrieval
    +
Semantic Document Retrieval
    ↓
Evidence Filtering
    ↓
LLM Response Generation
    ↓
Citation / Evidence Layer
    ↓
Compliance Pathway
```

The LLM must not be treated as the authoritative source of BIS facts. Retrieved evidence should drive factual responses.

## 12. Backend Requirements

Technology:
- Node.js
- Express.js
- PostgreSQL 18
- REST APIs

Initial API:
- `GET /api/health`

Future API areas:
- Standards search/recommendation
- Certification information
- Laboratory lookup
- RAG query
- Compliance pathway generation
- Query/history management

## 13. Frontend Requirements

The frontend should provide:
- Clean, professional BIS-oriented interface
- Conversational query input
- Search/result experience
- Evidence/source cards
- Standard information cards
- Certification information
- Laboratory information
- Compliance Pathway visualization
- Confidence/availability messaging
- Responsive design
- Multilingual-ready architecture

The interface should avoid looking like a generic AI chatbot.

## 14. Security and Privacy

The MVP should:
- Keep secrets in environment variables.
- Never commit `.env`.
- Avoid exposing database credentials.
- Validate API inputs.
- Avoid exposing sensitive server details in errors.
- Restrict backend/database access appropriately.
- Preserve source provenance.
- Avoid unnecessary personal information.
- Include appropriate disclaimers where guidance could be interpreted as compliance or regulatory advice.

## 15. Source and Evidence Rules

1. Prefer official BIS/Government sources.
2. Do not invent BIS standards, certification schemes, laboratory scopes or requirements.
3. Distinguish metadata from full standard text.
4. Do not claim access to restricted/full-text standards unless legitimately available.
5. Cite the source supporting factual BIS claims.
6. Preserve verified current/withdrawn/revision information.
7. If evidence is insufficient, abstain or clearly qualify the response.

## 16. MVP Acceptance Criteria

- [ ] Backend starts successfully.
- [ ] Backend connects to `bis_sakhi_db`.
- [ ] Verified BIS source metadata can be stored.
- [ ] Standards and status can be stored.
- [ ] Standard relationships can be stored.
- [ ] Certification information can be stored.
- [ ] Laboratories and relevant scopes can be stored.
- [ ] Documents/chunks can be retrieved.
- [ ] Motorcycle helmet demo query works.
- [ ] IS 4151:2015 can be identified from verified corpus.
- [ ] IS 4151:1993 withdrawn status can be identified from verified corpus.
- [ ] Relevant testing-lab information can be returned where supported.
- [ ] Supporting sources are displayed.
- [ ] Unsupported queries trigger safe abstention.
- [ ] Compliance Pathway is displayed.
- [ ] Basic browser/E2E tests pass.
- [ ] No critical known security issues remain for the MVP demo.

## 17. Development Workflow

1. Git repository and baseline
2. Backend foundation
3. PostgreSQL schema
4. Verified BIS seed data
5. Document ingestion
6. Retrieval/RAG
7. Compliance Pathway API
8. Frontend
9. Integration
10. Playwright testing
11. Code review
12. Security testing
13. Deployment
14. Demo preparation
15. SIH presentation

Agents should work on isolated tasks and should not simultaneously modify the same files.

## 18. MVP Priority

### P0 — Must Have
- Source-grounded BIS Q&A
- Standards recommendation
- Standard status
- Certification information
- Laboratory discovery
- Evidence/citations
- Compliance Pathway
- Safe abstention

### P1 — Should Have
- Multilingual interaction
- Better semantic ranking
- Related/allied standards
- Query history
- Improved visualizations

### P2 — Future
- Broad BIS catalogue coverage
- Advanced knowledge graph
- More BIS services
- Voice interaction
- Large-scale automated ingestion
- Advanced analytics

## 19. Success Definition

BIS-SAKHI succeeds as an MVP if a user can describe a product or ask a BIS-related question and receive a useful, understandable and evidence-backed pathway through:

**Applicable Standard → Certification → Testing → Laboratory → Next Steps**

without requiring the user to manually search multiple BIS services.

## 20. Product Principle

> **BIS-SAKHI should not try to know everything. It should clearly show what it knows, where that information came from, and when verified evidence is insufficient.**
