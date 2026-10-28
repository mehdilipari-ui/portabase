export const SYSTEM_ROLES = ["superadmin", "admin", "user", "pending"] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];
export const isSystemRole = (role: unknown): role is SystemRole =>
    SYSTEM_ROLES.includes(role as SystemRole);
const ORGANIZATION_ROLES = ["owner", "admin", "downloader", "member"] as const;
export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];
/** Owners and admins manage projects, databases and backups (restore, delete...). */
export const isOrganizationManager = (role: unknown): boolean =>
    role === "owner" || role === "admin";
/** Downloaders are read-only members who may also download backup files. */
export const canDownloadOrganizationBackups = (role: unknown): boolean =>
    isOrganizationManager(role) || role === "downloader";
