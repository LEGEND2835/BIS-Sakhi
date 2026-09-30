# BIS-SAKHI

### AI-Powered Assistance for Indian Standards and BIS Services

**BIS-SAKHI** is an AI-powered intelligent assistant developed for **Smart India Hackathon 2026** in response to the problem statement **“AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers.”**

The platform helps manufacturers, industries, and consumers understand relevant Indian Standards, certification pathways, testing requirements, BIS services, and related guidance through natural-language queries. It combines AI-based intent understanding with a curated, verified knowledge base to provide evidence-backed responses.

> **Describe your product. Understand the standard. Discover the next step.**

🌐 **Live Prototype:** https://bis-sakhi.vercel.app
💻 **GitHub Repository:** https://github.com/LEGEND2835/BIS-Sakhi

---

## The Problem

Finding and interpreting information about Indian Standards and BIS services can be difficult for manufacturers, small businesses, and consumers. Relevant information may be distributed across standards, certification guidance, laboratory listings, and consumer service resources.

Users may struggle to identify which standard applies to a product, understand certification requirements, locate relevant testing laboratories, or verify product-related information.

BIS-SAKHI aims to make this information easier to access and understand through a conversational, evidence-backed interface.

## Our Solution

BIS-SAKHI allows users to describe a product or ask a BIS-related question in natural language. The system identifies the query intent and retrieves relevant information from its curated knowledge base.

Where supported by the available records, the response can guide the user through a compliance pathway:

**Product Identification → Applicable Indian Standard → Certification Scheme → Testing Requirements → Relevant Laboratories → Evidence and Next Steps**

The prototype is designed to provide source-linked information, handle supported multilingual queries, and abstain when it cannot confidently identify a product from its verified knowledge base.

## Key Features

* **Natural-Language Product Search** — Describe a product or requirement in everyday language.
* **Indian Standard Recommendations** — Retrieve applicable standards for supported products.
* **Certification Guidance** — Present relevant certification scheme information and requirements available in the knowledge base.
* **Certification Process Guidance** — Explain the recorded steps involved in a certification pathway.
* **Testing Laboratory Discovery** — Show relevant recognized testing laboratories for supported standards and scopes.
* **Consumer and Hallmarking Guidance** — Provide information for supported BIS consumer-service and hallmarking queries, including HUID verification guidance.
* **Multilingual Interaction** — Support selected Hindi and English queries, with additional language handling demonstrated for supported cases.
* **Evidence-Backed Responses** — Include source references and, where available, technical document or clause references.
* **Confidence-Aware Responses** — Avoid presenting unsupported product matches as verified information.
* **Safe Abstention** — Ask users to clarify when the product or request cannot be confidently matched to the current knowledge base.

## How It Works

1. **User Query:** A user enters a product description or BIS-related question.
2. **Intent Understanding:** The AI layer interprets the query and identifies the relevant request category.
3. **Knowledge Retrieval:** The backend searches the curated BIS-SAKHI database for relevant product, standard, certification, laboratory, or guidance records.
4. **Response Preparation:** The system structures the retrieved information into a readable response and includes available supporting references.
5. **Localization:** Supported responses can be translated or localized for selected languages.
6. **User Guidance:** The user receives the available information, next steps, or a safe clarification response if the query is not sufficiently supported.

## Technology Stack

| Layer                        | Technology                                      |
| ---------------------------- | ----------------------------------------------- |
| Frontend                     | React, Vite, JavaScript, CSS                    |
| Backend                      | Node.js, Express.js                             |
| Database                     | PostgreSQL                                      |
| AI and Intent Understanding  | Groq API                                        |
| Response Localization        | Translation service integrated into the backend |
| Frontend Deployment          | Vercel                                          |
| Backend and Database Hosting | Render                                          |
| Version Control              | Git and GitHub                                  |

## System Architecture

```text
                    User
                     |
                     v
          React + Vite Web Interface
                     |
                     v
              Express API
                     |
          +----------+----------+
          |                     |
          v                     v
    AI Intent Detection    PostgreSQL
       (Groq API)          Knowledge Base
          |                     |
          +----------+----------+
                     |
                     v
       Verified, Structured Response
                     |
                     v
        Localization and Presentation
                     |
                     v
                    User
```

The AI layer helps interpret the user’s request, while the curated database provides the project’s structured domain information. Responses are limited by the coverage and quality of the knowledge base and its source records.

## Knowledge Base

The current prototype contains curated records for selected product and service areas, including:

* Motorcycle helmets
* Packaged drinking water
* Batteries
* Toys
* Hallmarking and HUID-related guidance
* Consumer guidance
* Certification process information
* Testing laboratory and laboratory-scope records

The prototype is not a complete repository of all Indian Standards or BIS services. Its responses depend on the records currently available in the knowledge base. Users should consult the linked official BIS sources for authoritative and updated requirements before making compliance decisions.

## Example Queries

Users can try queries such as:

* “I manufacture motorcycle helmets. Which Indian Standard applies, and where can I get the product tested?”
* “What is the applicable standard for packaged drinking water?”
* “How can I get BIS certification for my product?”
* “How can I verify the HUID on my gold jewellery?”
* “Can I use an older version of a standard for my product?”
* “Which laboratories are listed for testing this product?”

Queries outside the prototype’s verified coverage may receive a clarification or safe-abstention response.

## Running the Project Locally

### Prerequisites

* Node.js and npm
* PostgreSQL
* Git
* A Groq API key for AI-powered query handling

### 1. Clone the Repository

```bash
git clone https://github.com/LEGEND2835/BIS-Sakhi.git
cd BIS-Sakhi
```

### 2. Configure the Database

Create a PostgreSQL database for the project and configure the backend database connection using the environment-variable names expected by `backend/config/db.js`.

The database schema and curated seed files are available in the `docs/` directory. Apply the schema first, then run the relevant seed scripts against your local database.

### 3. Configure the Backend

Navigate to the backend:

```bash
cd backend
npm install
```

Create a `.env` file using `backend/.env.example` as a reference. Add your own database connection details and Groq API key. Do not commit secrets or `.env` files to GitHub.

Set the model to the supported model configured for your project, if required:

```env
GROQ_MODEL=openai/gpt-oss-20b
```

Start the backend using the script defined in `backend/package.json`.

### 4. Configure the Frontend

Open a second terminal from the repository root:

```bash
cd frontend
npm install
```

Configure the frontend API endpoint using a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000/api/ask
```

Use the actual local backend port and API route configured in your environment.

Start the frontend using:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Deployment

The current prototype is deployed using:

* **Frontend:** Vercel
* **Backend:** Render Web Service
* **Database:** Render PostgreSQL

**Live Prototype:** https://bis-sakhi.vercel.app

The frontend communicates with the deployed backend through its configured API URL. Deployment configuration and environment variables should be maintained in the respective hosting dashboards. Do not store API keys, database passwords, or other secrets in the repository.

## Validation

The project has been built and tested during development, including frontend production-build validation and focused checks of supported query flows.

The frontend production build completed successfully using Vite. Demonstrated test scenarios include supported product identification, certification guidance, multilingual HUID queries, and safe abstention for unsupported products.

Validation results describe the tested prototype and should not be interpreted as a guarantee of coverage for every product, standard, language, or BIS service.

## Project Status

**Status:** Working prototype deployed for demonstration.

BIS-SAKHI demonstrates an evidence-backed conversational workflow over a curated knowledge base. Further work for a production deployment would include broader and regularly maintained official-source coverage, expanded multilingual evaluation, security and privacy assessment, accessibility testing, load testing, and integration with relevant authorized BIS services where available.

## Social Impact and Potential

BIS-SAKHI is intended to make standards and BIS service information more accessible to manufacturers, MSMEs, consumers, and other stakeholders. By organizing relevant guidance into a conversational pathway, the project aims to reduce information-discovery effort, improve understanding, and support more informed product and compliance decisions.

Potential impact at larger scale would depend on verified data coverage, official-source maintenance, user adoption, and appropriate institutional collaboration.

## Team

**Team:** BHARAT NEXUS
**Team Leader:** Santanu Barua
**Institution:** Alliance University, Bengaluru
**Hackathon:** Smart India Hackathon 2026

## Disclaimer

BIS-SAKHI is a student-developed prototype created for Smart India Hackathon 2026. It is not an official Bureau of Indian Standards (BIS) platform and is not a substitute for official BIS publications, notifications, certification decisions, or professional compliance advice. Users should verify current requirements with official BIS sources.

The project uses its own BIS-SAKHI visual identity and does not claim to represent or be endorsed by BIS.

---

**Built to make Indian Standards and BIS services easier to discover, understand, and act upon.**
