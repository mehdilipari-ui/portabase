import {MemberWithUser} from "@/db/schema/03_organization";
import {OrganizationRole} from "@/lib/acl/role";


/** Instance-wide settings that tune what organization roles may do (fed from env, see organization-acl.server.ts). */
export type OrganizationAclOptions = {
    membersCanDownloadBackups: boolean;
};

export type OrganizationPermissions = {
    role: OrganizationRole | null;
    isOwner: boolean;
    isAdmin: boolean;
    isMember: boolean;

    canManageAgents: boolean;
    canManageSettings: boolean;
    canManageUsers: boolean;
    canManageNotifications: boolean;
    canManageStorages: boolean;
    canManageDangerZone: boolean;
    canManageDatabases: boolean;
    canDownloadBackups: boolean;
};


export const computeOrganizationPermissions = (
    activeMember: Pick<MemberWithUser, "role"> | null,
    options: OrganizationAclOptions,
): OrganizationPermissions => {
    const role = (activeMember?.role as OrganizationRole) ?? null;

    const isOwner = role === "owner";
    const isAdmin = role === "admin";
    const isMember = role === "member";
    const isManager = isOwner || isAdmin;

    return {
        role,
        isOwner,
        isAdmin,
        isMember,

        canManageSettings: isManager,
        canManageAgents: isManager,
        canManageUsers: isManager,
        canManageNotifications: isManager,
        canManageStorages: isManager,
        canManageDangerZone: isOwner,
        // Projects, databases and backups write operations (restore, delete, import, policies...).
        canManageDatabases: isManager,
        canDownloadBackups: isManager || (isMember && options.membersCanDownloadBackups),
    };
};
