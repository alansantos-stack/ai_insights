# security-implement-auth

Implement JWT authentication and/or Role-Based Access Control (RBAC) for a NestJS module.

## When to use
Use when setting up auth for a new module, adding role-based permissions, or implementing refresh token flow.

## Instructions

You are acting as the **Security Agent** for the AI Insights project (NestJS, JWT, bcrypt, Passport.js).

Given the requirements (which endpoints need auth, which roles are needed), generate production-ready auth implementation.

### 1. JWT Auth Strategy (`src/common/auth/`)

```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    return { id: payload.sub, email: payload.email, roles: payload.roles };
  }
}
```

### 2. JWT Guard
```typescript
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<T>(err: any, user: T, info: any): T {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

### 3. RBAC Implementation (if roles needed)
```typescript
// roles.decorator.ts
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}
```

### 4. Auth Service
```typescript
// Secure login with timing-safe comparison
async login(email: string, password: string): Promise<TokenPair> {
  const user = await this.userRepository.findByEmail(email, { select: ['id', 'email', 'passwordHash', 'roles'] });
  
  // Use constant-time comparison to prevent timing attacks
  const isValid = user ? await bcrypt.compare(password, user.passwordHash) : await bcrypt.compare(password, DUMMY_HASH);
  
  if (!user || !isValid) {
    throw new UnauthorizedException('Invalid credentials');  // Same message for both cases
  }
  
  return this.generateTokenPair(user);
}
```

### 5. Token Generation
```typescript
generateTokenPair(user: User): TokenPair {
  const payload: JwtPayload = { sub: user.id, email: user.email, roles: user.roles };
  return {
    accessToken: this.jwtService.sign(payload, { expiresIn: '1h' }),
    refreshToken: this.jwtService.sign({ sub: user.id }, { 
      expiresIn: '7d',
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    }),
  };
}
```

### 6. Applying to Controllers
```typescript
@Controller('resources')
@UseGuards(JwtAuthGuard, RolesGuard)  // Apply at class level for all routes
export class ResourceController {
  @Get()
  @Roles(Role.ADMIN, Role.USER)  // Roles required
  findAll() { ... }

  @Post()
  @Roles(Role.ADMIN)  // Admin only
  create() { ... }
}
```

### 7. Security Checklist
- [ ] JWT_SECRET is at least 32 characters, stored in env
- [ ] JWT_REFRESH_SECRET different from JWT_SECRET
- [ ] Access tokens expire ≤ 1h
- [ ] Refresh tokens stored hashed in DB (not raw)
- [ ] Rate limiting on `/auth/login` endpoint (max 5 req/15min)
- [ ] Failed auth attempts logged (no password logged)
- [ ] Logout invalidates refresh token
