import {
  FileText,
  ShieldCheck,
  FlaskConical,
  ExternalLink,
  Gem,
  BookOpen,
  Landmark,
  ArrowRight,
  ClipboardCheck,
  Globe,
  Search,
  Award,
} from "lucide-react";
import { Fragment } from "react";
import { Link } from "./router.jsx";

// Official BIS URLs already used in this project (docs/seed-*.sql).
// Only root forms of the same official hosts are used; no new URLs invented.
export const BIS_LINKS = {
  portal: "https://www.bis.gov.in/",
  knowYourStandard:
    "https://lims.bis.gov.in/home/search_is_number/?is_number__doc_no=16046",
  limsSearch: "https://lims.bis.gov.in/home/search_is_number/",
  lims: "https://lims.bis.gov.in/",
  productCertification:
    "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-i-mark-scheme/?lang=en",
  crs:
    "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-ii-registration-scheme/?lang=en",
  certificationFaq:
    "https://www.bis.gov.in/product-certification/product-certification-faq/",
  hallmarking: "https://www.bis.gov.in/hallmarking-overview/?lang=en",
  hallmarkingFaq:
    "https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/?lang=en",
  bisApps: "https://www.bis.gov.in/bis-apps/?lang=en",
  consumerProtection:
    "https://www.bis.gov.in/consumer-overview/consumer-overviews/consumer-protection/?lang=en",
};

/** Wrap informational content in a shared breadcrumb, heading, and layout. */
function PageShell({ eyebrow, title, intro, children }) {
  return (
    <div className="static-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <strong>{title}</strong>
        </div>

        <div className="page-heading">
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          {intro && <p>{intro}</p>}
        </div>

        {children}
      </div>
    </div>
  );
}

/** Render a labeled official resource link that opens in a new tab. */
function OfficialLink({ href, label }) {
  return (
    <a className="inline-official-link" href={href} target="_blank" rel="noreferrer">
      <ExternalLink size={13} />
      <span>{label}</span>
    </a>
  );
}

/* ---------------- STANDARDS ---------------- */

/** Render standards discovery guidance and links to official standard lookup. */
export function StandardsPage() {
  return (
    <PageShell
      eyebrow="KNOW YOUR STANDARDS"
      title="Know Your Standards"
      intro="BIS-SAKHI helps you discover the applicable Indian Standard (IS) for your product from a verified knowledge base, and guides you from your product to the right standard before certification."
    >
      <section className="page-section">
        <div className="home-section-header">
          <h2>Standards discovery with BIS-SAKHI</h2>
        </div>
        <p className="page-text">
          Describe what you manufacture in the BIS-SAKHI search on the home
          page. The assistant identifies your product, matches it against
          verified Indian Standards recorded in its knowledge base, and returns
          the applicable IS numbers with titles, revision years, and current
          status — so you always know which standard applies before you plan
          testing or certification.
        </p>
      </section>

      <section className="page-section">
        <div className="home-section-header">
          <h2>Product-to-standard guidance</h2>
        </div>
        <div className="services-grid">
          {[
            {
              icon: <ShieldCheck size={20} />,
              title: "Describe your product",
              text: "State the product and its use — for example motorcycle helmets, packaged drinking water, toys, or batteries.",
            },
            {
              icon: <BookOpen size={20} />,
              title: "Get matching IS numbers",
              text: "BIS-SAKHI returns applicable standards such as IS 4151 (helmets), IS 14543 (packaged water), or IS 16046 (batteries).",
            },
            {
              icon: <ClipboardCheck size={20} />,
              title: "Check status and scope",
              text: "Each result shows whether the standard is active or withdrawn, so superseded versions are never followed.",
            },
          ].map((card) => (
            <div className="service-card" key={card.title}>
              <div className="service-card-icon">{card.icon}</div>
              <div className="service-card-body">
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section">
        <p className="page-text">
          You can independently verify any Indian Standard number using the
          official BIS LIMS "Know Your Standard" service:{" "}
          <OfficialLink href={BIS_LINKS.knowYourStandard} label="Know Your Standard (BIS LIMS)" />
        </p>
        <Link className="page-cta" to="/">
          Search your product with BIS-SAKHI <ArrowRight size={14} />
        </Link>
      </section>
    </PageShell>
  );
}

/* ---------------- CERTIFICATION ---------------- */

/** Render BIS certification scheme summaries and application process guidance. */
export function CertificationPage() {
  return (
    <PageShell
      eyebrow="BIS CERTIFICATION"
      title="Certification"
      intro="Understand the BIS certification schemes that apply to your product, and how the certification process works from application to licence."
    >
      <section className="page-section">
        <div className="home-section-header">
          <h2>BIS certification schemes</h2>
        </div>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-card-icon">
              <ShieldCheck size={20} />
            </div>
            <div className="service-card-body">
              <h3>Scheme I — ISI Mark Licence</h3>
              <p>
                The conventional product certification scheme: the manufacturer
                is licensed to use the ISI mark after factory assessment and
                independent sample testing.
              </p>
              <OfficialLink href={BIS_LINKS.productCertification} label="Scheme I — Mark Scheme" />
            </div>
          </div>

          <div className="service-card">
            <div className="service-card-icon">
              <FileText size={20} />
            </div>
            <div className="service-card-body">
              <h3>Scheme II — Compulsory Registration (CRS)</h3>
              <p>
                For notified electronics and IT goods: the manufacturer
                registers on the basis of test reports from BIS-recognized
                laboratories.
              </p>
              <OfficialLink href={BIS_LINKS.crs} label="Scheme II — Registration Scheme" />
            </div>
          </div>

          <div className="service-card">
            <div className="service-card-icon">
              <Landmark size={20} />
            </div>
            <div className="service-card-body">
              <h3>Mandatory certification (QCOs)</h3>
              <p>
                Products covered by Quality Control Orders require BIS
                certification before sale in India. BIS-SAKHI flags mandatory
                schemes in its results.
              </p>
              <OfficialLink href={BIS_LINKS.certificationFaq} label="Product Certification FAQ" />
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="home-section-header">
          <h2>Certification-process guidance</h2>
        </div>
        <div className="steps-list page-steps">
          {[
            "Identify the applicable Indian Standard for your product.",
            "Confirm which certification scheme applies (ISI licence, CRS registration, or a mandatory QCO).",
            "Prepare the application, factory details, and testing plan for the standard's scope.",
            "Get samples tested at a BIS-recognized laboratory.",
            "Complete BIS assessment and grant requirements for the scheme.",
            "Maintain conformity through surveillance or registration renewal, as applicable.",
          ].map((step, index) => (
            <div className="next-step" key={index}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
        <Link className="page-cta" to="/">
          Ask BIS-SAKHI about your product's certification <ArrowRight size={14} />
        </Link>
      </section>
    </PageShell>
  );
}

/* ---------------- LABORATORIES ---------------- */

/** Render laboratory selection guidance and links to official BIS LIMS tools. */
export function LaboratoriesPage() {
  return (
    <PageShell
      eyebrow="TESTING LABORATORIES"
      title="Testing Laboratories"
      intro="Guidance on choosing a BIS-recognized testing laboratory whose scope matches your standard, and links to the official BIS LIMS."
    >
      <section className="page-section">
        <div className="home-section-header">
          <h2>Laboratory guidance</h2>
        </div>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-card-icon">
              <FlaskConical size={20} />
            </div>
            <div className="service-card-body">
              <h3>BIS laboratories</h3>
              <p>
                BIS operates central, regional, and branch laboratories for
                testing against Indian Standards as part of certification.
              </p>
            </div>
          </div>

          <div className="service-card">
            <div className="service-card-icon">
              <ClipboardCheck size={20} />
            </div>
            <div className="service-card-body">
              <h3>Recognized & empaneled labs</h3>
              <p>
                BIS also recognizes private laboratories for specific standard
                scopes. Always confirm the lab's recognition covers your IS
                number.
              </p>
            </div>
          </div>

          <div className="service-card">
            <div className="service-card-icon">
              <Award size={20} />
            </div>
            <div className="service-card-body">
              <h3>Match scope to standard</h3>
              <p>
                BIS-SAKHI lists recognized laboratories recorded for each
                standard in its results, along with lab codes where available.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <p className="page-text">
          Laboratory details, recognition status, and standard-wise testing
          information are available on the official Bureau of Indian Standards
          Laboratory Information Management System:
        </p>
        <div className="resource-links">
          <OfficialLink href={BIS_LINKS.lims} label="Official BIS LIMS Portal" />
          <OfficialLink href={BIS_LINKS.limsSearch} label="Search a Standard in BIS LIMS" />
        </div>
        <Link className="page-cta" to="/">
          Find labs for your product's standard <ArrowRight size={14} />
        </Link>
      </section>
    </PageShell>
  );
}

/* ---------------- BIS SERVICES ---------------- */

/** Render BIS service summaries with links to their official resources. */
export function ServicesPage() {
  const services = [
    {
      icon: <Gem size={20} />,
      title: "HUID / Hallmarking",
      text: "Hallmarked jewellery carries a HUID mark. Learn how hallmarking works and how to check HUID on the BIS Care apps.",
      links: [
        { href: BIS_LINKS.hallmarking, label: "Hallmarking overview" },
        { href: BIS_LINKS.bisApps, label: "Official BIS apps" },
      ],
    },
    {
      icon: <ShieldCheck size={20} />,
      title: "ISI verification",
      text: "The ISI mark shows conformity to an Indian Standard under Scheme I. Learn how certification marks are protected and verified.",
      links: [
        { href: BIS_LINKS.productCertification, label: "ISI mark scheme" },
      ],
    },
    {
      icon: <Globe size={20} />,
      title: "Consumer guidance",
      text: "Guidance for consumers on certified products, marking verification, and complaint and protection pathways.",
      links: [
        { href: BIS_LINKS.consumerProtection, label: "Consumer protection" },
      ],
    },
    {
      icon: <BookOpen size={20} />,
      title: "Standards lookup",
      text: "Look up any Indian Standard — its number, title, year, and status — through the official BIS LIMS service.",
      links: [
        { href: BIS_LINKS.knowYourStandard, label: "Know Your Standard" },
      ],
    },
    {
      icon: <FileText size={20} />,
      title: "Certification guidance",
      text: "Frequently asked questions on obtaining BIS product certification, schemes, documents, and process requirements.",
      links: [
        { href: BIS_LINKS.certificationFaq, label: "Certification FAQ" },
      ],
    },
  ];

  return (
    <PageShell
      eyebrow="BIS SERVICES"
      title="BIS Services"
      intro="Quick access to the core BIS services that BIS-SAKHI guides you through, each linked to the official BIS portal."
    >
      <div className="services-grid services-grid-2">
        {services.map((service) => (
          <div className="service-card service-card-vertical" key={service.title}>
            <div className="service-card-icon">{service.icon}</div>
            <div className="service-card-body">
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <div className="resource-links">
                {service.links.map((link) => (
                  <OfficialLink key={link.href} href={link.href} label={link.label} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

/* ---------------- RESOURCES ---------------- */

/** Render the directory of official BIS portals and reference resources. */
export function ResourcesPage() {
  const resources = [
    {
      title: "BIS Official Portal",
      text: "The main website of the Bureau of Indian Standards — schemes, notifications, and services.",
      href: BIS_LINKS.portal,
    },
    {
      title: "Know Your Standard",
      text: "Search Indian Standards by IS number through the official BIS LIMS service.",
      href: BIS_LINKS.knowYourStandard,
    },
    {
      title: "BIS LIMS",
      text: "The BIS Laboratory Information Management System for standards and laboratory information.",
      href: BIS_LINKS.lims,
    },
    {
      title: "Product Certification",
      text: "Products under compulsory certification and the applicable certification schemes.",
      href: BIS_LINKS.productCertification,
    },
    {
      title: "Hallmarking",
      text: "Hallmarking of gold and silver artefacts, HUID, and hallmarking FAQs.",
      href: BIS_LINKS.hallmarking,
    },
  ];

  return (
    <PageShell
      eyebrow="OFFICIAL RESOURCES"
      title="Resources"
      intro="Official BIS resources used across BIS-SAKHI, linking directly to the Bureau of Indian Standards websites."
    >
      <div className="resource-cards">
        {resources.map((resource) => (
          <a
            className="resource-card"
            key={resource.title}
            href={resource.href}
            target="_blank"
            rel="noreferrer"
          >
            <div className="resource-card-head">
              <BookOpen size={16} />
              <strong>{resource.title}</strong>
              <ExternalLink size={14} />
            </div>
            <p>{resource.text}</p>
          </a>
        ))}
      </div>
    </PageShell>
  );
}

/* ---------------- COMPLIANCE ---------------- */

/** Render the compliance pathway from product identification to next steps. */
export function CompliancePage() {
  const steps = [
    {
      title: "Product",
      text: "Identify the product you manufacture or purchase.",
    },
    {
      title: "Standard",
      text: "Find the applicable Indian Standard (IS) for that product.",
    },
    {
      title: "Certification Scheme",
      text: "Confirm the scheme that applies — ISI licence, CRS registration, or a mandatory QCO.",
    },
    {
      title: "Testing",
      text: "Plan testing to the clauses and parameters of the standard.",
    },
    {
      title: "Laboratory",
      text: "Choose a BIS-recognized laboratory with the right scope.",
    },
    {
      title: "Evidence",
      text: "Collect test reports, standard references, and official sources.",
    },
    {
      title: "Next Steps",
      text: "Proceed with certification, registration, or market requirements.",
    },
  ];

  return (
    <PageShell
      eyebrow="COMPLIANCE PATHWAY"
      title="Compliance"
      intro="The BIS-SAKHI compliance pathway — the sequence of steps from your product to verified conformity evidence."
    >
      <section className="page-section">
        <div className="pathway-line pathway-line-page">
          {steps.map((step, index) => (
            <Fragment key={step.title}>
              {index > 0 && <div className="path-connector active"></div>}
              <div className="path-step active">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.title}</strong>
              </div>
            </Fragment>
          ))}
        </div>

        <div className="compliance-detail-grid">
          {steps.map((step) => (
            <div className="compliance-detail" key={step.title}>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section">
        <p className="page-text">
          Start at the beginning: describe your product to BIS-SAKHI and follow
          the pathway it returns, backed by verified evidence and official BIS
          sources at every step.
        </p>
        <div className="resource-links">
          <Link className="page-cta" to="/">
            <Search size={14} /> Start with your product
          </Link>
          <OfficialLink href={BIS_LINKS.portal} label="BIS Official Portal" />
        </div>
      </section>
    </PageShell>
  );
}
