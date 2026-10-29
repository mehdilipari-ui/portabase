"use client";

import { computeOrganizationPermissions } from "@/lib/acl/organization-acl";
import { useAcl } from "@/lib/acl/acl-context";
import {MemberWithUser} from "@/db/schema/03_organization";

export const useOrganizationPermissions = (
	activeMember: Pick<MemberWithUser, "role"> | null,
) => {
	const { organizationAclOptions } = useAcl();
	return computeOrganizationPermissions(activeMember, organizationAclOptions);
};
