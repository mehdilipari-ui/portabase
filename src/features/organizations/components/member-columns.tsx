"use client";

import {ColumnDef} from "@tanstack/react-table";
import {MemberWithUser} from "@/db/schema/03_organization";
import {authClient, useSession} from "@/lib/auth/auth-client";
import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {Badge} from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {updateMemberRoleAction} from "@/features/organizations/actions/update-member.action";
import {RoleSchemaMember} from "@/features/organizations/schemas/member.schema";
import {useState} from "react";
import {useOrganizationPermissions} from "@/hooks/acl/use-organization-acl";


export function organizationMemberColumns(
    isDemoBlocked: boolean,
): ColumnDef<MemberWithUser>[] {

    return [
        {
            accessorKey: "role",
            header: "Role",
            cell: ({row}) => {
                const [role, setRole] = useState<string>(row.getValue("role"));
                const {data: session} = useSession();
                const activeOrgaMember = authClient.useActiveMember();

                const updateMutation = useMutation({
                    mutationFn: (nextRole: string) =>
                        updateMemberRoleAction({
                            memberId: row.original.id,
                            organizationId: row.original.organizationId,
                            role: RoleSchemaMember.parse(nextRole),
                        }),
                    onSuccess: (result, nextRole) => {
                        if (!result?.data?.success) {
                            toast.error("An error occurred while updating user information.");
                            return;
                        }
                        setRole(nextRole);
                        toast.success("User updated successfully.");
                    },
                    onError: () => {
                        toast.error("An error occurred while updating user information.");
                    },
                });

                const {canManageUsers} = useOrganizationPermissions(activeOrgaMember.data ?? null);

                // Only allow cycling between admin <-> member
                const handleUpdateRole = () => {
                    updateMutation.mutate(role === "admin" ? "member" : "admin");
                };

                const isCurrentUser = session?.user.email === row.original.user.email;
                const isRowRoleOwner = role === "owner";

                const isDisabled = !canManageUsers || isCurrentUser || isRowRoleOwner || isDemoBlocked;

                // Dynamic tooltip reason
                const disabledReason = isDemoBlocked
                    ? "Roles cannot be modified in the default organization in demo mode"
                    : isCurrentUser
                        ? "You cannot change your own role"
                        : isRowRoleOwner
                            ? "Owner role cannot be modified"
                            : "Members cannot edit roles";

                const badge = (
                    <Badge
                        className={
                            isDisabled || updateMutation.isPending
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer hover:bg-accent"
                        }
                        onClick={isDisabled || updateMutation.isPending ? undefined : handleUpdateRole}
                        variant="outline"
                    >
                        {role}
                    </Badge>
                );

                return isDisabled ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>{badge}</TooltipTrigger>
                            <TooltipContent>
                                <p>{disabledReason}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    badge
                );
            },
        },
        {
            accessorKey: "user.name",
            header: "Name",
        },
        {
            accessorKey: "user.email",
            header: "Email",
        },
    ] };