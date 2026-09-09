# AI-Powered Construction Safety & Risk Intelligence Platform - Backend

Enterprise-grade backend API service built with **Python 3.10+ / FastAPI**, **SQLAlchemy 2.0**, **PostgreSQL**, **Pydantic v2**, and **Alembic**.

---

## Architecture Overview

```text
backend/
├── app/
│   ├── main.py                     # FastAPI entrypoint, middleware, lifecycle & routing
│   ├── core/
│   │   ├── config.py               # Pydantic-settings configuration & environment loader
│   │   ├── security.py             # Bcrypt password hashing & JWT token handling
│   │   └── dependencies.py         # DB session, authentication & RBAC dependencies
│   ├── database/
│   │   ├── base.py                 # Declarative Base, UUID primary keys, and timestamp mixins
│   │   ├── session.py              # SQLAlchemy engine & sessionmaker pool
│   │   └── init_db.py              # Safe schema initialization without mock data
│   ├── models/                     # SQLAlchemy 2.0 Database ORM Models
│   │   ├── user.py                 # System users (Admin, Worker)
│   │   ├── worker.py               # Worker profiles, assignments, clearance & PPE
│   │   ├── attendance.py           # Check-in/out timestamps and working hours
│   │   ├── safety_issue.py         # Hazards, observations, and violation tracking
│   │   ├── safety_monitoring.py    # Safety audit scores and periodic inspections
│   │   ├── risk_analytics.py       # Multi-factor risk indices & zone assessments
│   │   ├── project.py              # Projects and project task breakdowns
│   │   ├── resource.py             # Materials and workforce allocation
│   │   ├── equipment.py            # Machinery, utilization & maintenance schedules
│   │   ├── report.py               # Daily safety & weekly project reports
│   │   ├── notification.py         # System alerts and notifications
│   │   ├── leave_request.py        # Worker leave requests & supervisor reviews
│   │   ├── gate_access.py          # Security gate check-ins & PPE barrier logs
│   │   ├── safety_compliance.py    # PPE audit compliance scores
│   │   └── site.py                 # Construction sites and hazard zones
│   ├── schemas/                    # Pydantic v2 Data Validation & Serialization Models
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── worker.py
│   │   ├── attendance.py
│   │   ├── safety_issue.py
│   │   ├── safety_monitoring.py
│   │   ├── risk_analytics.py
│   │   ├── project.py
│   │   ├── resource.py
│   │   ├── equipment.py
│   │   ├── report.py
│   │   ├── notification.py
│   │   ├── leave_request.py
│   │   ├── gate_access.py
│   │   ├── safety_compliance.py
│   │   └── site.py
│   ├── api/
│   │   ├── router.py               # Master API router aggregating all endpoints
│   │   └── endpoints/
│   │       ├── auth.py             # Register, Login, Me (JWT auth)
│   │       ├── users.py            # User management
│   │       ├── admin.py            # Admin/Manager dashboard, risk, resources, agentic AI
│   │       ├── workers.py          # Worker dashboard, attendance, PPE, leaves, reports
│   │       ├── attendance.py       # Check-in, check-out, summaries
│   │       ├── safety.py           # Safety issues & monitoring
│   │       ├── risks.py            # Risk assessments
│   │       ├── projects.py         # Projects & tasks
│   │       ├── resources.py        # Materials & resources
│   │       ├── equipment.py        # Machinery & maintenance
│   │       ├── reports.py          # Safety & project reports
│   │       ├── notifications.py    # Alerts
│   │       ├── leave.py            # Leave requests & approvals
│   │       ├── gate_access.py      # Entry/exit logs
│   │       ├── compliance.py       # PPE compliance auditing
│   │       └── sites.py            # Sites & zones
│   ├── services/                   # Pure business logic and database transaction services
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── worker_service.py
│   │   ├── attendance_service.py
│   │   ├── safety_service.py
│   │   ├── risk_service.py
│   │   ├── project_service.py
│   │   ├── resource_service.py
│   │   ├── report_service.py
│   │   ├── notification_service.py
│   │   └── leave_service.py
│   ├── ai/                         # AI / ML Service Interfaces & Placeholders
│   │   ├── __init__.py
│   │   ├── prediction_interface.py # Timeline & safety trend prediction interfaces
│   │   ├── risk_prediction_interface.py # Multi-factor zone risk indexing interface
│   │   └── computer_vision_interface.py # PPE detection & CCTV edge frames interface
│   └── utils/
│       ├── logger.py               # Formatted application logger
│       └── helpers.py              # Common utility functions
├── alembic/                        # Alembic migration scripts and environment
├── alembic.ini                     # Migration configuration
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment variable template
├── .gitignore
└── README.md
```

---

## Setup & Installation

### 1. Prerequisites
- Python 3.10+ (tested with Python 3.10 through 3.14)
- PostgreSQL (or SQLite for lightweight local development)

### 2. Create and Activate Virtual Environment
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` to configure your PostgreSQL credentials or set `DATABASE_URL`:
```env
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=construction_safety_db
POSTGRES_PORT=5432
JWT_SECRET_KEY=your_secret_jwt_key
```

*(Optional development mode without PostgreSQL)*:
```env
DATABASE_URL=sqlite:///./construction_safety.db
```

### 5. Run Database Migrations
```bash
# Initialize migration version
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

### 6. Start the Backend Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.

---

## Interactive API Documentation

Once the server is running, explore the interactive documentation:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## Core API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user (`ADMIN` or `WORKER`)
- `POST /api/auth/login` - Authenticate and retrieve JWT token
- `GET  /api/auth/me` - Get current authenticated user profile

### Admin / Site Manager (`/api/admin`) *(Admin Only)*
- `GET  /api/admin/dashboard` - Overall site statistics, safety score, active workers
- `GET  /api/admin/safety-monitoring` - Safety trend analysis and active violation counts
- `GET  /api/admin/worker-safety` - Worker safety compliance records
- `GET  /api/admin/risk-analytics` - Site and zone risk index breakdowns
- `GET  /api/admin/projects` - Project progress and task schedules
- `GET  /api/admin/resources` - Materials and equipment utilization
- `POST /api/admin/predictions/delay` - AI delay prediction placeholder
- `POST /api/admin/predictions/zone-risk` - AI dynamic zone risk calculation placeholder
- `POST /api/admin/agentic-ai/query` - Agentic AI reasoning and action planner interface
- `GET  /api/admin/reports` - Daily safety and weekly project reports
- `GET  /api/admin/settings` - System settings and feature flags

### Worker Portal (`/api/workers`) *(Worker Only)*
- `GET  /api/workers/dashboard` - Worker dashboard summary
- `GET  /api/workers/attendance` - Worker attendance history and hours
- `GET  /api/workers/gate-access` - Checkpoint gate entry/exit logs
- `GET  /api/workers/safety-status` - Worker PPE compliance status
- `POST /api/workers/report-issue` - Submit a safety observation or hazard
- `GET  /api/workers/reports` - View submitted reports
- `POST /api/workers/leave` - Submit a leave application
- `GET  /api/workers/leave` - View leave status
- `GET  /api/workers/notifications` - View worker alerts
- `PATCH /api/workers/notifications/{id}/read` - Mark alert as read
- `GET  /api/workers/profile` - Worker profile
- `PUT  /api/workers/profile` - Update worker contact info

### Operational Endpoints
- `/api/attendance` - Check-in, check-out, and daily summaries
- `/api/safety` - Hazard issues and monitoring records
- `/api/risks` - Multi-factor risk assessments
- `/api/projects` - Project and task management
- `/api/resources` - Resource management
- `/api/equipment` - Machinery and maintenance schedules
- `/api/gate-access` - Security gate access control
- `/api/compliance` - PPE compliance evaluation
- `/api/sites` - Site and construction zone management

---

## AI & ML Interfaces

The backend is built with extensible abstract classes in `app/ai/`:
- `BasePredictionEngine`: For timeline delay and safety trend forecasting
- `BaseRiskEngine`: For multi-factor zone risk indexing
- `BaseComputerVisionEngine`: For automated PPE inspection and hazard detection

Models can be connected at any time by implementing these interfaces without altering router contracts or frontend interfaces.
