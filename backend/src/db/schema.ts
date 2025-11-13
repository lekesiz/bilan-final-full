import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, boolean, index } from 'drizzle-orm/pg-core';

// Table: assessments (bilans de compétences)
export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull(),

  // Données du bilan
  userName: varchar('user_name', { length: 255 }).notNull(),
  packageId: varchar('package_id', { length: 50 }).notNull(),
  packageName: varchar('package_name', { length: 255 }).notNull(),
  coachingStyle: varchar('coaching_style', { length: 50 }).notNull(),

  // État du bilan
  status: varchar('status', { length: 50 }).notNull().default('in_progress'),
  currentQuestionIndex: integer('current_question_index').default(0),
  totalQuestions: integer('total_questions').notNull(),

  // Dates
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  lastActivityAt: timestamp('last_activity_at').notNull().defaultNow(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  // Données JSON
  userProfile: jsonb('user_profile'), // { fullName, currentRole, keySkills, pastExperiences }
  dashboardData: jsonb('dashboard_data'), // { themes, skills }
}, (table) => ({
  clerkUserIdIdx: index('idx_clerk_user_id').on(table.clerkUserId),
  statusIdx: index('idx_status').on(table.status),
  startedAtIdx: index('idx_started_at').on(table.startedAt),
  lastActivityAtIdx: index('idx_last_activity_at').on(table.lastActivityAt),
  completedAtIdx: index('idx_completed_at').on(table.completedAt),
  // Composite index for common query: userId + status
  userIdStatusIdx: index('idx_user_id_status').on(table.clerkUserId, table.status),
}));

// Table: answers (réponses aux questions)
export const answers = pgTable('answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),

  // Question
  questionId: varchar('question_id', { length: 255 }).notNull(),
  questionTitle: text('question_title').notNull(),
  questionDescription: text('question_description'), // Soru açıklaması/detayı
  questionType: varchar('question_type', { length: 50 }).notNull(),
  questionTheme: varchar('question_theme', { length: 255 }),
  questionChoices: jsonb('question_choices'), // Multiple choice seçenekleri (string[])

  // Réponse
  value: text('value').notNull(),

  // Métadonnées
  answeredAt: timestamp('answered_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  assessmentIdIdx: index('idx_assessment_id_answers').on(table.assessmentId),
  answeredAtIdx: index('idx_answered_at').on(table.answeredAt),
}));

// Table: summaries (synthèses finales)
export const summaries = pgTable('summaries', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }).unique(),

  // Synthèse complète (JSON structuré)
  profileType: varchar('profile_type', { length: 255 }).notNull(),
  priorityThemes: jsonb('priority_themes').notNull(), // string[]
  maturityLevel: text('maturity_level').notNull(),
  keyStrengths: jsonb('key_strengths').notNull(), // SummaryPoint[]
  areasForDevelopment: jsonb('areas_for_development').notNull(), // SummaryPoint[]
  recommendations: jsonb('recommendations').notNull(), // string[]
  actionPlan: jsonb('action_plan').notNull(), // { shortTerm, mediumTerm }

  // Métadonnées
  generatedAt: timestamp('generated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  assessmentIdIdx: index('idx_assessment_id_summaries').on(table.assessmentId),
}));

// Table: satisfaction_ratings (satisfaction par phase)
export const satisfactionRatings = pgTable('satisfaction_ratings', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),

  phaseName: varchar('phase_name', { length: 255 }).notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  assessmentIdIdx: index('idx_assessment_id_ratings').on(table.assessmentId),
}));

// Table: modules (modules optionnels complétés)
export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),

  moduleId: varchar('module_id', { length: 100 }).notNull(),
  reason: text('reason').notNull(),
  accepted: boolean('accepted').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  assessmentIdIdx: index('idx_assessment_id_modules').on(table.assessmentId),
}));

// ============================================
// RBAC Tables (Role-Based Access Control)
// ============================================

// Table: users (kullanıcılar)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(), // bcrypt hash
  name: varchar('name', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  isActiveIdx: index('idx_users_is_active').on(table.isActive),
}));

// Table: roles (roller)
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  isSystem: boolean('is_system').notNull().default(false), // System roles cannot be deleted
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  nameIdx: index('idx_roles_name').on(table.name),
}));

// Table: permissions (izinler)
// Note: Unique constraint (resource, action) is defined in migration SQL
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  resource: varchar('resource', { length: 100 }).notNull(), // e.g., 'bilan:assessment'
  action: varchar('action', { length: 50 }).notNull(), // e.g., 'create', 'read', 'update', 'delete'
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  resourceActionIdx: index('idx_permissions_resource_action').on(table.resource, table.action),
}));

// Table: role_permissions (many-to-many: roles <-> permissions)
export const rolePermissions = pgTable('role_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  roleIdIdx: index('idx_role_permissions_role_id').on(table.roleId),
  permissionIdIdx: index('idx_role_permissions_permission_id').on(table.permissionId),
  uniqueRolePermission: index('idx_role_permissions_unique').on(table.roleId, table.permissionId),
}));

// Table: user_roles (many-to-many: users <-> roles)
export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_user_roles_user_id').on(table.userId),
  roleIdIdx: index('idx_user_roles_role_id').on(table.roleId),
  uniqueUserRole: index('idx_user_roles_unique').on(table.userId, table.roleId),
}));

// Table: dashboard_modules (dashboard modülleri)
export const dashboardModules = pgTable('dashboard_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 100 }),
  route: varchar('route', { length: 255 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  nameIdx: index('idx_dashboard_modules_name').on(table.name),
  routeIdx: index('idx_dashboard_modules_route').on(table.route),
  isActiveIdx: index('idx_dashboard_modules_is_active').on(table.isActive),
}));

// Table: module_permissions (many-to-many: modules <-> permissions)
export const modulePermissions = pgTable('module_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id').notNull().references(() => dashboardModules.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  moduleIdIdx: index('idx_module_permissions_module_id').on(table.moduleId),
  permissionIdIdx: index('idx_module_permissions_permission_id').on(table.permissionId),
  uniqueModulePermission: index('idx_module_permissions_unique').on(table.moduleId, table.permissionId),
}));

// Update assessments table to reference users table
// Note: We'll keep clerkUserId for backward compatibility, but add userId reference
// Migration will handle the transition

// Types inférés
export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;
export type SatisfactionRating = typeof satisfactionRatings.$inferSelect;
export type NewSatisfactionRating = typeof satisfactionRatings.$inferInsert;
export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;

// RBAC Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
export type DashboardModule = typeof dashboardModules.$inferSelect;
export type NewDashboardModule = typeof dashboardModules.$inferInsert;
export type ModulePermission = typeof modulePermissions.$inferSelect;
export type NewModulePermission = typeof modulePermissions.$inferInsert;
