import {MemberWithUser} from "@/db/schema/03_organization";
import {canDownloadOrganizationBackups, OrganizationRole} from "@/lib/acl/role";


export type OrganizationPermissions = {
    role: OrganizationRole | null;
    isOwner: boolean;
    isAdmin: boolean;
    isMember: boolean;
    isDownloader: boolean;

    canManageAgents: boolean;
    canManageSettings: boolean;
    canManageUsers: boolean;
    canManageNotifications: boolean;
    canManageStorages: boolean;
    canManageDangerZone: boolean;
    canDownloadBackups: boolean;
};


export const computeOrganizationPermissions = (
    activeMember: MemberWithUser | null
): OrganizationPermissions => {
    const role = (activeMember?.role as OrganizationRole) ?? null;

    const isOwner = role === "owner";
    const isAdmin = role === "admin";
    const isMember = role === "member";
    const isDownloader = role === "downloader";

    return {
        role,
        isOwner,
        isAdmin,
        isMember,
        isDownloader,

        canManageSettings: isOwner || isAdmin,
        canManageAgents: isOwner || isAdmin,
        canManageUsers: isOwner || isAdmin,
        canManageNotifications: isOwner || isAdmin,
        canManageStorages: isOwner || isAdmin,
        canManageDangerZone: isOwner,
        canDownloadBackups: canDownloadOrganizationBackups(role),
    };
};
