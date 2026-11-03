"use client";

import {createContext, useContext, ReactNode} from "react";
import {User} from "@/db/schema/02_user";
import {useSystemPermissions} from "@/hooks/acl/use-system-acl";
import {SystemPermissions} from "@/lib/acl/system-acl";
import {OrganizationAclOptions} from "@/lib/acl/organization-acl";


type AclContextType = {
    isDemoEnabled: boolean;
    isSuperAdminAndDemo: boolean;
    user: User;
    permissions: SystemPermissions;
    organizationAclOptions: OrganizationAclOptions;
};

const AclContext = createContext<AclContextType | undefined>(undefined);

export const AclProvider = ({demo, user, organizationAclOptions, children}: {
    demo: boolean,
    user: User,
    organizationAclOptions: OrganizationAclOptions,
    children: ReactNode
}) => {
    const permissions = useSystemPermissions(user);
    const isSuperAdminAndDemo = demo && permissions.isSuperAdmin;

    return (
        <AclContext.Provider value={{isDemoEnabled: demo, user, permissions, isSuperAdminAndDemo, organizationAclOptions}}>
            {children}
        </AclContext.Provider>
    );
};

export const useAcl = () => {
    const context = useContext(AclContext);
    if (!context) throw new Error("useAcl must be used within AclProvider");
    return context;
};
