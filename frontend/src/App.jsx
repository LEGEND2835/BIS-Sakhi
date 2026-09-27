import { useEffect, useState } from "react";
import {
  Search,
  Menu,
  ChevronRight,
  ExternalLink,
  FlaskConical,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import "./App.css";
import { Link, useRouter } from "./router.jsx";
import {
  StandardsPage,
  CertificationPage,
  LaboratoriesPage,
  ServicesPage,
  ResourcesPage,
  CompliancePage,
} from "./pages.jsx";

const API_URL = "http://localhost:3000/api/ask";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/standards", label: "Know Your Standards" },
  { to: "/certification", label: "Certification" },
  { to: "/laboratories", label: "Testing Laboratories" },
  { to: "/services", label: "BIS Services" },
  { to: "/resources", label: "Resources" },
  { to: "/compliance", label: "Compliance" },
];

const STATIC_ROUTES = {
  "/standards": StandardsPage,
  "/certification": CertificationPage,
  "/laboratories": LaboratoriesPage,
  "/services": ServicesPage,
  "/resources": ResourcesPage,
  "/compliance": CompliancePage,
};

function StaticPage({ path }) {
  const Page = STATIC_ROUTES[path];
  return Page ? <Page /> : null;
}

const examples = [
  "Motorcycle Helmets",
  "Packaged Drinking Water",
  "Toys",
  "Batteries",
];

const popularPathways = [
  {
    title: "Motorcycle Helmets",
    query: "Motorcycle Helmets",
    standard: "IS 4151",
    desc: "Protective helmets for two-wheeler riders across India.",
    scheme: "Mandatory ISI Mark",
  },
  {
    title: "Packaged Drinking Water",
    query: "Packaged Drinking Water",
    standard: "IS 14543:2024",
    desc: "Packaged drinking water other than natural mineral water.",
    scheme: "Certification status requires verification",
  },
  {
    title: "Toys",
    query: "Toys",
    standard: "IS 9873 / IS 15644",
    desc: "Safety of toys covering physical, mechanical, and electrical safety.",
    scheme: "Certification/revision status requires verification",
  },
  {
    title: "Batteries",
    query: "Batteries",
    standard: "IS 16046",
    desc: "Secondary cells and batteries containing alkaline or non-acid electrolytes.",
    scheme: "Compulsory Registration (CRS)",
  },
];

function formatIntent(intent) {
  if (!intent) return null;
  const intentMap = {
    standard_query: "Standards Inquiry",
    standard_testing: "Standards & Testing",
    certification: "Certification Requirements",
    certification_process: "Certification Process",
    laboratory: "Testing Laboratories",
    consumer: "Consumer Guidance",
    hallmarking: "Hallmarking Inquiry",
    general: "General BIS Guidance",
    unsupported: "General Inquiry",
  };
  return intentMap[intent] || intent.replace(/_/g, " ");
}

function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const { path } = useRouter();

  // Close menu panels whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [path]);

  async function askSakhi(question = query) {
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Hindi control reuses the existing backend localization mechanism:
        // the Groq query-understanding layer detects the language hint and the
        // backend localizes its response via the existing localize service.
        body: JSON.stringify({
          query:
            language === "hi"
              ? `${question}\n(कृपया उत्तर हिंदी में दें। Please respond in Hindi.)`
              : question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      setResult(data);
      setTimeout(() => {
        const anchor = document.getElementById("search-results-anchor");
        if (anchor) {
          anchor.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
    } catch (err) {
      setError(
        "Unable to connect to the BIS-SAKHI backend server. Please ensure the backend is running on http://localhost:3000."
      );
    } finally {
      setLoading(false);
    }
  }

  function submit(e) {
    if (e && e.preventDefault) e.preventDefault();
    askSakhi();
  }

  return (
    <div className="site">

      {/* Top utility bar */}
      <div className="utility-bar">
        <div className="container utility-inner">
          <span>Bureau of Indian Standards</span>

          <div className="utility-links">
            <Link to="/standards">Standards</Link>
            <Link to="/laboratories">Laboratories</Link>
            <Link to="/certification">Certification</Link>
            <button
              type="button"
              className={"lang-toggle" + (language === "hi" ? " active" : "")}
              onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="container header-inner">

          <div className="brand">
            <div className="bis-symbol">
              <div className="bis-symbol-inner">
                <span></span>
              </div>
            </div>

            <div>
              <div className="brand-title">BIS-SAKHI</div>
              <div className="brand-subtitle">
                AI Assistant for Indian Standards & BIS Services
              </div>
            </div>
          </div>

          <nav className="desktop-nav">
            <Link to="/standards" className={path === "/standards" ? "active" : ""}>Standards</Link>
            <Link to="/resources" className={path === "/resources" ? "active" : ""}>Resources</Link>
            <Link to="/compliance" className={path === "/compliance" ? "active" : ""}>Compliance</Link>
            <Link to="/laboratories" className={path === "/laboratories" ? "active" : ""}>Laboratories</Link>
            <div className="menu-wrap">
              <button type="button" onClick={() => setMenuOpen(!menuOpen)}>
                Menu
              </button>
              {menuOpen && (
                <div className="menu-panel">
                  {NAV_LINKS.map((link) => (
                    <Link key={link.to} to={link.to}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <button
            className="mobile-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu size={21} />
          </button>
        </div>
      </header>

      {/* Mobile menu panel (renders under header) */}
      {mobileOpen && (
        <div className="mobile-menu-panel">
          <div className="container">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
              ))}
          </div>
        </div>
      )}

      {/* Blue navigation */}
      <div className="main-nav">
        <div className="container nav-inner">
          {NAV_LINKS.slice(0, 5).map((link) => (
            <Link key={link.to} to={link.to} className={path === link.to ? "active" : ""}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <main>
        {path === "/" ? (
          <>

        {/* Search hero */}
        <section className="search-section">
          <div className="container">

            <div className="breadcrumb">
              Home <ChevronRight size={14} /> BIS-SAKHI
            </div>

            <div className="search-heading">
              <div>
                <div className="eyebrow">BIS-SAKHI</div>
                <h1>Find the standards and requirements for your product</h1>
                <p>
                  Describe what you manufacture or the BIS requirement you
                  want to understand.
                </p>
              </div>
            </div>

            <form className="search-form" onSubmit={submit}>
              <div className="search-input-wrap">
                <Search size={21} />
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit(e);
                    }
                  }}
                  placeholder="Example: I manufacture motorcycle helmets. What BIS standard applies and where can I get it tested?"
                  rows={2}
                />
              </div>

              <button
                className="search-button"
                type="submit"
                disabled={loading || !query.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="spin" size={18} />
                    Searching
                  </>
                ) : (
                  <>
                    Search
                    <Search size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="example-row">
              <span>Popular searches</span>

              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setQuery(example);
                    const textarea = document.querySelector(".search-input-wrap textarea");
                    if (textarea) textarea.focus();
                  }}
                >
                  {example}
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* Loading state indicator */}
        {loading && (
          <div className="container" id="search-results-anchor">
            <div className="loading-state">
              <Loader2 className="spin" size={30} />
              <h3>Consulting BIS-SAKHI Knowledge Base...</h3>
              <p>
                Retrieving verified Indian Standards, certification requirements,
                and testing laboratories.
              </p>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && !loading && (
          <div className="container" id="search-results-anchor">
            <div className="error-message">
              <AlertTriangle size={20} />
              <div>
                <strong>Backend Service Notice</strong>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Homepage Empty State */}
        {!result && !loading && (
          <div className="homepage-content">
            {/* Services Section */}
            <section className="services-section">
              <div className="container">
                <div className="home-section-header">
                  <div className="eyebrow">GUIDANCE & CAPABILITIES</div>
                  <h2>What can BIS-SAKHI help you with?</h2>
                </div>

                <div className="services-grid">
                  <div className="service-card">
                    <div className="service-card-icon">
                      <FileText size={20} />
                    </div>
                    <div className="service-card-body">
                      <h3>Find Indian Standards</h3>
                      <p>
                        Identify applicable Indian Standards (IS numbers), specifications, product scopes, and revision statuses.
                      </p>
                    </div>
                  </div>

                  <div className="service-card">
                    <div className="service-card-icon">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="service-card-body">
                      <h3>Understand Certification</h3>
                      <p>
                        Determine mandatory ISI mark licensing, Compulsory Registration Scheme (CRS), and Quality Control Orders (QCO).
                      </p>
                    </div>
                  </div>

                  <div className="service-card">
                    <div className="service-card-icon">
                      <FlaskConical size={20} />
                    </div>
                    <div className="service-card-body">
                      <h3>Find Testing Laboratories</h3>
                      <p>
                        Locate recognized BIS central and regional testing laboratories and empaneled private testing facilities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Popular Compliance Pathways */}
            <section className="pathways-overview-section">
              <div className="container">
                <div className="home-section-header">
                  <div className="eyebrow">FREQUENTLY QUERIED STANDARDS</div>
                  <h2>Popular compliance pathways</h2>
                </div>

                <div className="pathway-cards-grid">
                  {popularPathways.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      className="pathway-card"
                      onClick={() => {
                        setQuery(item.query);
                        const textarea = document.querySelector(".search-input-wrap textarea");
                        if (textarea) textarea.focus();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <div className="pathway-card-title-row">
                        <strong>{item.title}</strong>
                        <ChevronRight size={15} />
                      </div>
                      <div className="pathway-card-standard">{item.standard}</div>
                      <p className="pathway-card-desc">{item.desc}</p>
                      <div className="pathway-card-scheme">{item.scheme}</div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Result */}
        <div className="container" id="search-results-anchor">

          {result?.abstained && (
            <section className="result-area">
              <div className="page-title">
                <div className="eyebrow">SAFE ABSTENTION</div>
                <h2>Product Not Confidently Identified</h2>
              </div>

              <div className="abstention">
                <AlertTriangle size={24} />
                <div>
                  <strong>Product not identified in verified knowledge base</strong>
                  <p>
                    {result.message ||
                      "I could not confidently identify a product covered by my verified BIS-SAKHI knowledge base."}
                  </p>
                  <span>
                    {result.next_step ||
                      "Please describe the product more specifically."}
                  </span>
                  {result.ai_intent?.intent === "unsupported" && (
                    <p className="abstention-unsupported">
                      Note: This query may fall outside mandatory Indian Standards or BIS certification schemes currently recorded in the system.
                    </p>
                  )}
                </div>
              </div>

              <div className="new-search">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setQuery("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Start another search
                </button>
              </div>
            </section>
          )}

          {result && !result.abstained && (
            <section className="result-area">

              {/* Result heading */}
              <div className="result-heading">
                <div>
                  <div className="eyebrow">BIS-SAKHI RESULT</div>
                  <h2>Compliance information</h2>
                </div>

                <div className="confidence">
                  <ShieldCheck size={16} />
                  {Math.round(result.confidence * 100)}% confidence
                </div>
              </div>

              {/* Product */}
              {result.intent !== "hallmarking" &&
                result.intent !== "consumer" && (
                <div className="product-result">
                  <div className="product-result-main">
                    <div>
                      <div className="eyebrow">PRODUCT IDENTIFIED</div>

                      <h3>
                        {typeof result.detected_product === "string"
                          ? result.detected_product
                          : result.detected_product?.name ||
                            "General BIS Certification"}
                      </h3>

                      {typeof result.detected_product === "object" &&
                        result.detected_product?.category && (
                          <p>{result.detected_product.category}</p>
                        )}
                    </div>

                    {result.ai_intent?.intent && (
                      <div className="ai-intent-tag">
                        <span>Query intent:</span>{" "}
                        {formatIntent(result.ai_intent.intent)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Consumer Guidance */}
              {result.intent === "consumer" &&
                result.consumer_guidance && (
                  <section className="next-steps consumer-guidance">
                    <div className="section-heading">
                      <div>
                        <div className="eyebrow">CONSUMER GUIDANCE</div>
                        <h2>
                          {result.consumer_guidance.topic
                            ?.replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </h2>
                      </div>
                    </div>

                    <div className="guidance-card">
                      <p>{result.consumer_guidance.answer}</p>

                      {result.consumer_guidance.source?.url && (
                        <div className="cert-source-link">
                          <a
                            href={result.consumer_guidance.source.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FileText size={13} />
                            <span>Official BIS Source</span>
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      )}
                    </div>
                  </section>
                )}

              {/* Hallmarking Guidance */}
              {result.intent === "hallmarking" &&
                result.hallmarking &&
                !result.abstained && (
                  <section className="hallmarking-result">
                    <div className="section-heading">
                      <div>
                        <div className="eyebrow">HALLMARKING GUIDANCE</div>
                        <h2>
                          {result.hallmarking.topic
                            ?.replace(/_/g, " ")
                            .replace(/\b\w/g, (char) => char.toUpperCase())}
                        </h2>
                      </div>
                    </div>

                    <div className="hallmarking-card">
                      <p>{result.hallmarking.answer}</p>

                      {result.hallmarking.source && (
                        <div className="evidence-section">
                          <div className="data-label">
                            <FileText size={17} />
                            OFFICIAL BIS SOURCE
                          </div>

                          <div className="evidence-list">
                            <a
                              href={result.hallmarking.source.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span>{result.hallmarking.source.name}</span>
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

              {/* Certification Process */}
              {result.intent === "certification_process" &&
                result.certification_process?.length > 0 && (
                  <section className="next-steps certification-process">
                    <div className="section-heading">
                      <div>
                        <div className="eyebrow">
                          BIS CERTIFICATION PROCESS
                        </div>

                        <h2>
                          How to get BIS certification
                        </h2>
                      </div>
                    </div>

                    <div className="steps-list">
                      {result.certification_process.map((step) => (
                        <div
                          className="next-step"
                          key={step.step}
                        >
                          <span>{step.step}</span>

                          <div>
                            <strong>{step.title}</strong>

                            <p>{step.description}</p>

                            {step.source && (
                              <div className="cert-source-link">
                                <a
                                  href={step.source.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <FileText size={13} />
                                  <span>
                                    {step.source.name ||
                                      "Official BIS Source"}
                                  </span>
                                  <ExternalLink size={13} />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              {result.intent !== "hallmarking" &&
                result.intent !== "certification_process" &&
                result.intent !== "consumer" && (
                <>
                  {/* Pathway */}
                  <div className="pathway">
                    <div className="section-heading">
                      <div>
                        <div className="eyebrow">COMPLIANCE PATHWAY</div>
                        <h2>Applicable requirements flow</h2>
                      </div>
                    </div>

                    <div className="pathway-line">
                      <div className="path-step active">
                        <span>01</span>
                        <strong>Product</strong>
                      </div>

                      <div className="path-connector active"></div>

                      <div className="path-step active">
                        <span>02</span>
                        <strong>Standard</strong>
                      </div>

                      <div className="path-connector active"></div>

                      <div className="path-step active">
                        <span>03</span>
                        <strong>Certification</strong>
                      </div>

                      <div className="path-connector active"></div>

                      <div className="path-step active">
                        <span>04</span>
                        <strong>Testing</strong>
                      </div>

                      <div className="path-connector active"></div>

                      <div className="path-step active">
                        <span>05</span>
                        <strong>Next steps</strong>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Standards */}
              {result.compliance_pathway?.standards?.map((standard) => (
                <div className="standard-result" key={standard.number}>

                  <div className="standard-top">
                    <div>
                      <div className="eyebrow">APPLICABLE INDIAN STANDARD</div>
                      <h3>
                        {standard.number}
                        {standard.year && (
                          <span className="standard-year">({standard.year})</span>
                        )}
                      </h3>
                      <p>{standard.title}</p>
                    </div>

                    <span
                      className={
                        standard.status?.toLowerCase() === "active"
                          ? "active-status"
                          : "status-warning"
                      }
                    >
                      {standard.status || "Status unverified"}
                    </span>
                  </div>

                  <div className="standard-grid">

                    {/* Certification */}
                    <div className="data-block">
                      <div className="data-label">
                        <ShieldCheck size={17} />
                        CERTIFICATION
                      </div>

                      <strong>
                        {standard.certification?.scheme ||
                          "Information unavailable"}
                      </strong>

                      {standard.certification?.scheme_code && (
                        <div className="scheme-code">
                          Scheme Code: {standard.certification.scheme_code}
                        </div>
                      )}

                      {standard.certification?.requirement_status && (
                        <span
                          className={
                            standard.certification.requirement_status
                              ?.toLowerCase()
                              .includes("de-notified") ||
                            standard.certification.requirement_status
                              ?.toLowerCase()
                              .includes("warning")
                              ? "status-warning"
                              : "status-required"
                          }
                        >
                          {standard.certification.requirement_status}
                        </span>
                      )}

                      {standard.certification?.description && (
                        <p>{standard.certification.description}</p>
                      )}

                      {standard.certification?.source && (
                        <div className="cert-source-link">
                          <a
                            href={standard.certification.source}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span>Official Scheme Documentation</span>
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Labs */}
                    <div className="data-block">
                      <div className="data-label">
                        <FlaskConical size={17} />
                        TESTING
                      </div>

                      <strong>
                        {standard.laboratories?.length || 0} recognized laboratories
                      </strong>

                      <p>
                        Testing laboratories recognized by BIS for this standard
                        scope are listed below.
                      </p>
                    </div>

                  </div>

                  {/* Laboratories */}
                  <div className="laboratory-section">
                    <div className="data-label">
                      <FlaskConical size={17} />
                      RELEVANT TESTING LABORATORIES
                    </div>

                    {standard.laboratories && standard.laboratories.length > 0 ? (
                      <div className="laboratory-table">
                        {standard.laboratories.map((lab, index) => (
                          <div className="laboratory-row" key={index}>
                            <div className="lab-number">
                              {String(index + 1).padStart(2, "0")}
                            </div>

                            <div className="lab-name">
                              <strong>{lab.name}</strong>
                              {lab.code && (
                                <span>Lab Code: {lab.code}</span>
                              )}
                            </div>

                            <ExternalLink size={16} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-data-notice">
                        No specific testing laboratories currently recorded for this standard in the database.
                      </div>
                    )}
                  </div>

                  {/* Evidence */}
                  {standard.evidence && standard.evidence.length > 0 && (
                    <div className="evidence-section">
                      <div className="data-label">
                        <FileText size={17} />
                        VERIFIED EVIDENCE & OFFICIAL SOURCES
                      </div>

                      <div className="evidence-list">
                        {standard.evidence.map((item, index) => (
                          <div className="evidence-item" key={item.id || index}>
                            <div className="evidence-item-header">
                              <div>
                                <strong>
                                  {item.type
                                    ?.replace(/_/g, " ")
                                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                                </strong>

                                {item.standard && (
                                  <span className="evidence-standard">
                                    {item.standard}
                                  </span>
                                )}

                                {item.clause_reference && (
                                  <span className="evidence-clause">
                                    Clause {item.clause_reference}
                                  </span>
                                )}
                              </div>

                              {item.source && (
                                <a
                                  href={item.source}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="evidence-source-link"
                                >
                                  <span>Official BIS Source</span>
                                  <ExternalLink size={13} />
                                </a>
                              )}
                            </div>

                            {item.reference && (
                              <p className="evidence-reference">
                                {item.reference}
                              </p>
                            )}

                            {(item.section_title || item.page_number) && (
                              <div className="evidence-meta">
                                {item.section_title && (
                                  <span>
                                    Section: {item.section_title}
                                  </span>
                                )}

                                {item.page_number && (
                                  <span>
                                    Page: {item.page_number}
                                  </span>
                                )}
                              </div>
                            )}

                            {item.source_name && (
                              <div className="evidence-source-name">
                                {item.source_name}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ))}

              {/* Warnings */}
              {result.warnings?.length > 0 && (
                <div className="warning-section">
                  <AlertTriangle size={20} />

                  <div>
                    <strong>Important Regulatory Warnings</strong>

                    {result.warnings.map((warning, index) => (
                      <p key={index}>{warning}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Next steps */}
              {result.compliance_pathway?.next_steps?.length > 0 && (
                <div className="next-steps">
                  <div className="section-heading">
                    <div>
                      <div className="eyebrow">NEXT STEPS</div>
                      <h2>What to do next</h2>
                    </div>
                  </div>

                  <div className="steps-list">
                    {result.compliance_pathway.next_steps.map(
                      (step, index) => (
                        <div className="next-step" key={index}>
                          <span>{index + 1}</span>
                          <p>{step}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="new-search">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setQuery("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Start another search
                </button>
              </div>

            </section>
          )}
        </div>
          </>
        ) : (
          <StaticPage path={path} />
        )}
      </main>

      {/* Footer */}
      <footer>
        <div className="container footer-inner">
          <div>
            <strong>BIS-SAKHI</strong>
            <p>
              AI-powered assistance for Indian Standards and BIS services.
            </p>
          </div>

          <div className="footer-links">
            <Link to="/standards">Standards</Link>
            <Link to="/certification">Certification</Link>
            <Link to="/laboratories">Laboratories</Link>
            <Link to="/services">BIS Services</Link>
          </div>

          <div className="footer-copy">
            Evidence-first · Confidence-aware · Safe by design
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container">
            <div className="footer-disclaimer">
              BIS-SAKHI is a student prototype developed for Smart India Hackathon 2026.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
