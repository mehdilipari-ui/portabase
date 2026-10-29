"use client";

import {BackupWith} from "@/db/schema/07_database";
import {useBackupModal} from "@/features/database/components/backup-modal-context";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {MoreHorizontal, Trash2, Download} from "lucide-react";
import {ReloadIcon} from "@radix-ui/react-icons";
import {cn} from "@/lib/utils";
import {isReplica} from "@/features/database/utils/backup-method";
import {MemberWithUser} from "@/db/schema/03_organization";
import {TooltipCustom} from "@/components/common/tooltip-custom";
import {useOrganizationPermissions} from "@/hooks/acl/use-organization-acl";

interface DatabaseActionsCellProps {
    backup: BackupWith;
    activeMember: MemberWithUser;
    isAlreadyRestore: boolean;
    isBackupOnly: boolean;
}

export function DatabaseActionsCell({backup, activeMember, isAlreadyRestore, isBackupOnly}: DatabaseActionsCellProps) {
    const {openModal} = useBackupModal();
    const {canManageDatabases, canDownloadBackups} = useOrganizationPermissions(activeMember);

    if (backup.deletedAt || (!canManageDatabases && !canDownloadBackups)) return null;

    const liveStorages = backup.storages?.filter((storage) => storage.deletedAt === null) ?? [];
    const canDownload = canDownloadBackups && (liveStorages.length === 0 || liveStorages.some((storage) => storage.engine === "archive"));
    const canRestore = canManageDatabases && (liveStorages.length === 0 || liveStorages.some((storage) => !isReplica(storage.engine)));

    // Read-only members only get the download entry.
    if (!canManageDatabases && (backup.status !== "success" || !canDownload)) return null;

    return (
        <div className={cn("flex items-center space-x-2")}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" type="button" onClick={(e) => e.stopPropagation()}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="w-4 h-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {backup.status == "success" ? (
                        <>
                            {!isBackupOnly && canRestore && (
                                <TooltipCustom disabled={isAlreadyRestore}
                                               text="Already a restoration waiting">
                                    <DropdownMenuItem
                                        disabled={isAlreadyRestore}
                                        onSelect={() => openModal("restore", backup)}
                                    >
                                        <ReloadIcon/> Restore
                                    </DropdownMenuItem>
                                </TooltipCustom>
                            )}
                            {canDownload && (
                                <DropdownMenuItem
                                    onSelect={() => openModal("download", backup)}
                                >
                                    <Download/> Download
                                </DropdownMenuItem>
                            )}
                        </>
                    ) : null}

                    {canManageDatabases && (
                        <>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem onSelect={() => openModal("delete", backup)} className="text-red-600">
                                <Trash2/> Delete
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

    );
}

