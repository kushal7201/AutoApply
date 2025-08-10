# AutoApply

> A tool that ingests a candidate's resume and profile, searches jobs across web portals with rich filters, and automatically fills & submits applications (including account creation when required). Includes a "batch rapid-apply" mode and a full audit UI showing every attempted application and its status.

## 🎯 Goals & Core Value

- **Save time** for job seekers by discovering relevant roles and automating repetitive application steps
- **Provide transparent auditability** - what was filled, what failed, why
- **Keep the user in control** - consent, inline manual intervention, and protect credentials/privacy

## 🚀 Key User Stories

- Upload resume/profile once and search/filter jobs across many sources
- Click "Fill automatically" and AutoApply completes & submits the application using the candidate's profile
- Run "RapidApply" to auto-apply to up to N jobs (configurable; default 25–50)
- Review an "Applications Filled" dashboard with statuses, logs, and error details
- Pause and prompt the user when a portal needs extra info (CAPTCHA, 2FA, ambiguous fields)
- Optionally auto-create accounts using stored credentials or use the user's browser session (extension)

## 🛠️ Tech Stack

- **Frontend:** React (Vite) + Chrome/Edge Extension (Manifest V3)
- **Backend:** Node.js + Express
- **Automation:** Python + Playwright (Docker)
- **Queue System:** RabbitMQ + Python Celery
- **Database:** MongoDB + Mongoose
- **File Storage:** Cloudinary
- **Security:** HashiCorp Vault/KMS for credential encryption
- **Auth:** JWT + refresh tokens with MFA support

## ✨ Core Features (MVP)

### Profile & Resume Management
- PDF/DOCX upload to Cloudinary with parsing to structured fields
- Manual edit & field-mapping preview
- Support for multiple resume variants

### Job Search & Discovery
- Unified search across connectors (aggregators + company pages)
- Rich filters: title, job type, location (radius), salary, posted date, experience, remote, keywords, company, source
- Save searches & alerts
- Job cards with confidence scores for autofill success

### Auto-Fill Engine
- Intelligent mapping to form elements, file upload, checkboxes, multi-step forms
- Two modes:
  - **Browser-extension assisted** (recommended) - uses user's logged-in session
  - **Playwright workers** for server-side automation where permitted

### RapidApply (Batch Processing)
- Configurable queue (default 25 jobs)
- Concurrency & throttle settings
- Priority ordering
- Pause-on-prompt or best-effort modes

### Applications Dashboard
- Per-application metadata with timestamps
- Status tracking (Success / Partial / Failed / Pending)
- Screenshots and logs for each attempt
- Direct links to portals
- Retry/cancel/manual edit options

### Account Management & Security
- Encrypted vault for credentials
- Auto-create accounts (opt-in)
- Browser session/OAuth integration where available
- Human-in-the-loop for CAPTCHAs, 2FA, ambiguous fields

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │    │   Node.js API    │    │  Python Workers │
│   (Vite Build)  │◄──►│   (Express)      │◄──►│   (Playwright)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         │                        │                       │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Browser Ext.    │    │    MongoDB       │    │   RabbitMQ      │
│ (Manifest V3)   │    │   (Mongoose)     │    │   + Celery      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                 │
                    ┌──────────────────┐
                    │   Cloudinary     │
                    │ (Files & Assets) │
                    └──────────────────┘
```

## 📊 Data Model

### Core Entities
- **User:** Authentication, preferences, vault references
- **CandidateProfile:** Resume data, parsed fields, custom information
- **Job:** Source details, application URLs, company info, salary data
- **Connector:** Portal mappings, success rates, configuration
- **ApplicationLog:** Attempt history, status, screenshots, error details
- **MappingRule:** Field mappings per portal with version control

## 🔧 Connector & Automation Design

### Two Operational Modes

1. **Client/Extension-Assisted** (Recommended)
   - Uses user's logged-in session
   - Lower TOS risk & higher success rate
   - Real-time form filling assistance

2. **Server Playwright Workers**
   - Full automation using stored credentials
   - Use sparingly and only for compliant portals
   - Headful mode when needed

### Features
- DOM heuristics + ML label matching for field detection
- Manual overrides & saved templates
- Multi-step flow persistence
- Step-by-step screenshots + HTML snapshots for audit

## 🛡️ Security & Privacy

### Data Protection
- Encrypted credential storage (Vault/KMS)
- GDPR/CCPA compliance with data deletion
- Zero-knowledge architecture where possible
- Immutable audit logs

### Legal Compliance
- Explicit consent for auto-submissions
- Per-portal opt-out capabilities
- Rate limiting & polite scraping
- No automated CAPTCHA solving without consent

### Risk Mitigation
- Prefer official APIs over automation
- Extension-assisted flows to reduce TOS violations
- Daily application caps to prevent spam behavior
- Legal counsel consultation for server automation

## 🔄 Error Handling & Human-in-the-Loop

### Error Categories
- Validation errors
- CAPTCHA/anti-bot challenges
- Login/account failures
- 2FA requirements
- Upload errors
- Unexpected DOM changes

### Response Strategy
- **Non-blocking errors:** Retry with exponential backoff
- **Blocking errors:** Pause and prompt user with context
- **Failed retries:** Mark as failed with full artifact storage

## 📈 Development Phases

### Phase 1 (MVP - 6-10 weeks)
- [ ] Resume parsing & profile editor
- [ ] Job search aggregator
- [ ] Browser extension assisted filling
- [ ] Applications dashboard
- [ ] Human-in-the-loop prompts

### Phase 2
- [ ] RapidApply batch processing
- [ ] Server Playwright workers
- [ ] Field mapping editor
- [ ] Analytics & retry policies

### Phase 3
- [ ] LLM-powered mapping
- [ ] Resume tailoring
- [ ] Enterprise features
- [ ] ATS integrations

## 🚦 API Examples

```javascript
// Upload resume and create profile
POST /api/profile

// Search jobs with filters
GET /api/jobs?query=software&location=remote&salary=100000

// Initiate application
POST /api/jobs/:id/apply

// Check application status
GET /api/applications/:task_id/status

// Save portal mapping
POST /api/connectors/:portal/mapping
```

## 📊 Monitoring & Analytics

### Metrics Tracked
- Per-portal success rates
- Average time per application
- Error categorization
- User activity patterns
- Queue depth and worker performance

### Artifacts Stored
- Screenshots for each step
- HTML snapshots
- Form data submitted
- Error logs and stack traces
- Downloadable audit reports

## ⚖️ Ethical Guidelines

- Default to manual confirmation for account creation
- Explicit portal automation disclosure
- User-configurable daily application limits
- Transparent logging of all actions
- Easy revocation of automation permissions

## 🧪 Testing Strategy

- **Unit Tests:** Mapping & parsing logic
- **Integration Tests:** Connector sandbox testing
- **E2E Tests:** Complete application flows
- **Chaos Testing:** DOM change resilience
- **Security Audits:** Regular penetration testing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB
- RabbitMQ
- Docker (for workers)

### Installation
```bash
# Clone the repository
git clone https://github.com/kushal7201/AutoApply.git
cd AutoApply

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development servers
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Legal Disclaimer

AutoApply is designed to assist job seekers in managing their applications. Users are responsible for ensuring compliance with the terms of service of job portals and applicable laws. Always obtain explicit permission before automating interactions with third-party websites.

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and code of conduct before submitting pull requests.

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub or contact our support team.

---

**Built with ❤️ for job seekers everywhere**