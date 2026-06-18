# Multi-Agent System - Quick Reference

## When to Use Each Agent

### 🎯 Leader Agent
**Use when**: Managing features, coordinating work, distributing tasks, monitoring progress

**Command**: `/leader`

**Common Tasks**:
- Breaking down user stories into tasks
- Assigning work to team members
- Resolving conflicts between recommendations
- Monitoring project progress

---

### 🏗️ Architect Agent
**Use when**: Designing systems, making technical decisions, planning architecture

**Command**: `/architect`

**Common Tasks**:
- Designing new feature architecture
- Choosing technologies and frameworks
- Creating API contracts (OpenAPI specs)
- Reviewing technical feasibility
- Writing Architecture Decision Records (ADRs)

---

### 💻 Backend Agent
**Use when**: Building server-side logic, implementing APIs, creating services

**Command**: `/backend`

**Common Tasks**:
- Implementing NestJS controllers/services
- Creating REST endpoints
- Building business logic
- Implementing authentication/authorization
- Optimizing query performance

---

### 🎨 Frontend Agent
**Use when**: Building user interfaces, implementing React components, styling

**Command**: `/frontend`

**Common Tasks**:
- Creating React/Next.js components
- Implementing responsive layouts
- Managing state
- Improving performance
- Ensuring accessibility (WCAG 2.1 AA)

---

### 🗄️ Database Agent
**Use when**: Designing schemas, managing migrations, optimizing queries

**Command**: `/database`

**Common Tasks**:
- Designing database schemas
- Creating migrations
- Optimizing queries and indexes
- Fixing N+1 problems
- Planning backup strategies

---

### ✅ QA Agent
**Use when**: Writing tests, planning test strategies, ensuring quality

**Command**: `/qa`

**Common Tasks**:
- Writing unit tests
- Writing integration tests
- Creating test strategies
- Increasing test coverage
- Identifying test gaps

---

### 🔒 Security Agent
**Use when**: Reviewing security, implementing authentication, preventing vulnerabilities

**Command**: `/security`

**Common Tasks**:
- Code security reviews
- Implementing authentication/authorization
- Identifying vulnerabilities
- Ensuring OWASP compliance
- Protecting sensitive data

---

### 🚀 DevOps Agent
**Use when**: Setting up CI/CD, deployment, infrastructure, monitoring

**Command**: `/devops`

**Common Tasks**:
- Creating CI/CD pipelines
- Dockerizing applications
- Configuring deployments
- Setting up monitoring
- Managing infrastructure

---

### 👥 Code Review Agent
**Use when**: Reviewing pull requests, verifying quality, ensuring standards

**Command**: `/code-review`

**Common Tasks**:
- Reviewing code for quality
- Verifying test coverage
- Checking security
- Ensuring standards compliance
- Providing constructive feedback

---

### 📚 Documentation Agent
**Use when**: Writing docs, creating guides, maintaining knowledge

**Command**: `/documentation`

**Common Tasks**:
- Writing API documentation
- Creating setup guides
- Documenting architecture
- Recording design decisions (ADRs)
- Maintaining README and CHANGELOG

---

## Workflow Example: Building a New Feature

```
1. User submits feature request
   ↓
2. Leader Agent analyzes and decomposes it
   ↓
3. Architect Agent designs the solution
   ↓
4. Parallel Development:
   ├─ Backend Agent implements API
   ├─ Frontend Agent builds UI
   ├─ Database Agent creates schema
   └─ QA Agent writes tests
   ↓
5. Security Agent reviews code
   ↓
6. Code Review Agent verifies quality
   ↓
7. DevOps Agent prepares deployment
   ↓
8. Documentation Agent updates docs
   ↓
9. Feature deployed to production
```

## Communication Between Agents

### Frontend ↔ Backend
- Frontend requests API endpoints via Architect
- Backend defines request/response contracts
- Frontend consumes APIs as specified

### Backend ↔ Database
- Backend needs optimized queries
- Database creates indexes and schema
- Backend implements efficient data access

### All → Code Review
- Before any merge/PR, Code Review Agent verifies quality
- Code Review is the final quality gate

### All → Security
- For sensitive features, Security Agent reviews
- Ensures no vulnerabilities introduced

### All → Documentation
- After completing a feature
- Documentation Agent updates guides and API docs

### All → DevOps
- When ready for deployment
- DevOps Agent prepares infrastructure

## Quality Standards (All Agents)

✅ **Code Quality**: Follow SOLID principles
✅ **Naming**: Use clear, consistent naming
✅ **Testing**: Minimum 80% code coverage
✅ **Security**: No hardcoded secrets, proper validation
✅ **Documentation**: Code is self-documenting, complex logic commented
✅ **Performance**: Optimized queries, no N+1 problems
✅ **Error Handling**: Proper exception handling and logging

## Integration with Development Workflow

### Daily Development
```
Morning:
├─ Check Leader Agent for task assignments
├─ Update progress
└─ Ask relevant agent for guidance

During Development:
├─ Use Architect for design questions
├─ Use Backend/Frontend for implementation
├─ Use Database for schema changes
└─ Use QA for testing strategy

Before Commit:
├─ Run tests (QA Agent recommendations)
├─ Check code quality (Code Review Agent)
├─ Verify security (Security Agent)
└─ Update documentation (Documentation Agent)

Before Merge:
├─ Get Code Review Agent approval
├─ Ensure all tests passing
├─ Verify test coverage ≥ 80%
└─ Confirm documentation complete

Deployment:
├─ DevOps Agent handles deployment
├─ Monitoring active
└─ Rollback plan ready
```

## Common Patterns

### Adding a New API Endpoint
1. **Architect Agent**: Design API contract (OpenAPI spec)
2. **Backend Agent**: Implement controller and service
3. **Database Agent**: Create/update schema if needed
4. **QA Agent**: Write tests
5. **Security Agent**: Review authentication/authorization
6. **Code Review Agent**: Approve quality
7. **Documentation Agent**: Update API docs

### Optimizing a Slow Query
1. **Backend Agent**: Identify the issue
2. **Database Agent**: Analyze and optimize
3. **QA Agent**: Test performance improvement
4. **Code Review Agent**: Verify correctness
5. **Documentation Agent**: Document the optimization

### Deploying to Production
1. **Code Review Agent**: Final quality check
2. **Security Agent**: Final security check
3. **QA Agent**: Verify test coverage
4. **DevOps Agent**: Execute deployment
5. **Documentation Agent**: Update deployment docs

## Quick Reference Commands

```bash
# Check agent guidelines
cat .claude/agents/[agent-name].agent.md

# View overall system architecture
cat AGENTS.md

# Check agent definitions
ls -la .claude/agents/

# Common development commands
npm run start:dev          # Start backend
npm run dev               # Start frontend
npm run test              # Run tests
npm run test:cov          # Test with coverage
npm run lint              # Check code quality
npm run format            # Format code
```

## When You're Unsure

| Question | Use Agent |
|----------|-----------|
| "How should I design this feature?" | Architect |
| "What database changes do I need?" | Database |
| "How do I implement this API?" | Backend |
| "How do I build this UI?" | Frontend |
| "What tests should I write?" | QA |
| "Is this secure?" | Security |
| "Should I merge this PR?" | Code Review |
| "How do I deploy this?" | DevOps |
| "How should I document this?" | Documentation |
| "What should I work on next?" | Leader |

---

**Last Updated**: June 2026
**System Version**: 1.0
