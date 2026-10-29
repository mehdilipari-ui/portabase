import "server-only";
import {env} from "@/env.mjs";
import {MemberWithUser} from "@/db/schema/03_organization";
import {
    computeOrganizationPermissions,
    type OrganizationAclOptions,
    type OrganizationPermissions,
} from "@/lib/acl/organization-acl";

export const getOrganizationAclOptions = (): OrganizationAclOptions => ({
    membersCanDownloadBackups: env.ORG_MEMBERS_CAN_DOWNLOAD_BACKUPS,
});

export const getOrganizationPermissions = (activeMember: Pick<MemberWithUser, "role"> | null): OrganizationPermissions =>
    computeOrganizationPermissions(activeMember, getOrganizationAclOptions());
