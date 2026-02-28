# AWS Terraform Multi-Agent Workflow UI

A production-grade NextJS 16 + Tailwind v4 UI for the AWS Terraform Multi-Agent Workflow system.

## Features

- **Five-Agent Pipeline Visualization**: Planner → Generator → Validator → Cost Estimator → Human Approval → Deployer
- **Real-time Workflow Logs**: Track agent activity with timestamps
- **Infrastructure Plan Viewer**: Visual representation of resources to be created
- **Validation Report**: Security findings with severity levels
- **Cost Estimation**: Monthly/annual costs with environment comparison
- **Mandatory Human Approval Gate**: Architecturally enforced before any deployment
- **Multi-Environment Support**: Dev, Staging, Production with different configurations

## Tech Stack

- Next.js 16 with Turbopack
- React 19
- Tailwind CSS v4
- shadcn/ui components
- Zustand for state management
- TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# The static export will be in the `dist` folder
```

## Deployment to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login (opens browser)
vercel login

# Deploy
vercel --prod
```

### Option 2: Git Integration

1. Push this project to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Deploy automatically on every push

### Option 3: Manual Upload

1. Build the project: `npm run build`
2. The `dist` folder contains the static export
3. Upload to Vercel via drag-and-drop at [vercel.com/new](https://vercel.com/new)

## Workflow Simulation

This UI includes a simulated workflow that demonstrates the full pipeline:

1. **Planner**: Generates a mock infrastructure plan with VPC, subnets, and RDS
2. **Generator**: Creates sample Terraform HCL
3. **Validator**: Runs mock security scans (Checkov rules)
4. **Cost Estimator**: Calculates mock AWS pricing
5. **Human Approval**: Pauses for your explicit approval/rejection
6. **Deployer**: Simulates terraform apply

## Project Structure

```
my-app/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── workflow-dashboard.tsx
│   ├── workflow-input.tsx
│   ├── agent-pipeline.tsx
│   ├── infrastructure-views.tsx
│   ├── cost-estimate-view.tsx
│   ├── approval-gate.tsx
│   ├── deployment-result.tsx
│   └── workflow-logs.tsx
├── store/                 # Zustand store
│   └── workflow-store.ts
├── types/                 # TypeScript types
│   └── workflow.ts
└── lib/                   # Utilities
    └── utils.ts
```

## Environment Variables

No environment variables required for the demo. For production use with real agents:

```env
# OpenAI API Key (for agent orchestration)
OPENAI_API_KEY=sk-...

# AWS Credentials (for actual deployments)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-southeast-2
```

## Safety Invariants

This UI enforces the same safety principles as the backend:

1. **No auto-approve**: Human approval is mandatory before deployment
2. **Validation-first**: Syntax, security, and cost gates must pass
3. **Environment-aware**: Different configurations for dev/staging/prod
4. **Audit trail**: All decisions are logged with timestamps

## License

MIT
