"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { MoreVertical, Mail, Phone } from "lucide-react";
import {
  BaseCardProps,
  UserCardUser,
  UserCardEmployee,
  UserStatus,
  USER_STATUS_CONFIG,
  USER_ROLE_LABELS,
} from "./types";
import { UserCardSkeleton } from "./UserCardSkeleton";

/**
 * UserCard - Carte utilisateur avec variants compact/detailed
 *
 * SP-123 : Composants métier SmartPlanning
 *
 * Features :
 * - Variants compact (1 ligne) et detailed (multi-lignes)
 * - Badge statut dynamique (Actif, Congé, Absent, Inactif)
 * - Actions dropdown configurables
 * - Mode sélection avec checkbox
 * - Dark mode support
 * - Accessibilité WCAG AA
 *
 * @example
 * ```tsx
 * <UserCard
 *   user={{ id: "1", name: "Jean Dupont", email: "jean@email.com", role: "MANAGER" }}
 *   employee={{ firstName: "Jean", lastName: "Dupont", jobTitle: "Product Manager" }}
 *   status="active"
 *   variant="detailed"
 *   actions={[
 *     { label: "Voir profil", icon: User, onClick: () => {} },
 *     { label: "Supprimer", icon: Trash2, onClick: () => {}, variant: "destructive" },
 *   ]}
 * />
 * ```
 */

export interface UserCardProps extends BaseCardProps {
  /** Données utilisateur (compatible Prisma User) */
  user: UserCardUser;

  /** Données employé optionnelles (pour variant detailed) */
  employee?: UserCardEmployee;

  /** Statut dynamique */
  status?: UserStatus;

  /** Carte sélectionnée (mode sélection) */
  isSelected?: boolean;

  /** Callback de sélection (affiche checkbox si défini) */
  onSelect?: (selected: boolean) => void;

  /** Callback au clic sur la carte */
  onClick?: () => void;
}

/**
 * Extrait les initiales d'un nom
 */
function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  if (parts.length === 1) {
    return first.charAt(0).toUpperCase();
  }
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

/**
 * Obtient le nom complet (employé ou user)
 */
function getDisplayName(
  user: UserCardUser,
  employee?: UserCardEmployee
): string {
  if (employee) {
    return `${employee.firstName} ${employee.lastName}`;
  }
  return user.name || user.email;
}

/**
 * Obtient le sous-titre (job title ou rôle)
 */
function getSubtitle(user: UserCardUser, employee?: UserCardEmployee): string {
  if (employee?.jobTitle) {
    return employee.jobTitle;
  }
  return USER_ROLE_LABELS[user.role] ?? user.role;
}

/**
 * Obtient la config du statut avec fallback
 */
function getStatusConfig(status: UserStatus) {
  return USER_STATUS_CONFIG[status] ?? USER_STATUS_CONFIG.active;
}

export const UserCard = React.forwardRef<HTMLDivElement, UserCardProps>(
  (
    {
      user,
      employee,
      status = "active",
      variant = "compact",
      actions,
      isLoading,
      isSelected,
      onSelect,
      onClick,
      className,
    },
    ref
  ) => {
    // État loading : afficher skeleton
    if (isLoading) {
      return <UserCardSkeleton variant={variant} className={className} />;
    }

    const displayName = getDisplayName(user, employee);
    const subtitle = getSubtitle(user, employee);
    const statusConfig = getStatusConfig(status);
    const isClickable = !!onClick;
    const hasSelection = typeof onSelect === "function";

    // Variant COMPACT
    if (variant === "compact") {
      return (
        <Card
          ref={ref}
          className={cn(
            "flex items-center gap-3 p-3",
            "transition-all duration-200",
            isClickable && "cursor-pointer hover:bg-accent/50",
            isSelected && "ring-2 ring-primary ring-offset-2",
            className
          )}
          onClick={onClick}
        >
          {/* Checkbox sélection */}
          {hasSelection && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(checked === true)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Sélectionner ${displayName}`}
            />
          )}

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-10 w-10">
              {user.image && (
                <AvatarImage src={user.image} alt={displayName} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            {/* Point statut */}
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                statusConfig.dotColor
              )}
              aria-label={statusConfig.label}
            />
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          </div>

          {/* Badge statut */}
          <Badge
            variant="outline"
            className={cn("text-xs flex-shrink-0", statusConfig.color)}
          >
            {statusConfig.label}
          </Badge>

          {/* Actions dropdown */}
          {actions && actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "p-1 rounded-md hover:bg-accent",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  )}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Actions"
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => (
                  <React.Fragment key={index}>
                    {action.separator && index > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                      disabled={action.disabled}
                      className={cn(
                        action.variant === "destructive" &&
                          "text-destructive focus:text-destructive"
                      )}
                    >
                      {action.icon && (
                        <action.icon className="mr-2 h-4 w-4" />
                      )}
                      {action.label}
                    </DropdownMenuItem>
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </Card>
      );
    }

    // Variant DETAILED
    return (
      <Card
        ref={ref}
        className={cn(
          "p-4",
          "transition-all duration-200",
          isClickable && "cursor-pointer hover:bg-accent/50",
          isSelected && "ring-2 ring-primary ring-offset-2",
          className
        )}
        onClick={onClick}
      >
        {/* Header avec checkbox et actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Checkbox sélection */}
            {hasSelection && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(checked === true)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Sélectionner ${displayName}`}
              />
            )}

            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-16 w-16">
                {user.image && (
                  <AvatarImage src={user.image} alt={displayName} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              {/* Point statut */}
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background",
                  statusConfig.dotColor
                )}
                aria-label={statusConfig.label}
              />
            </div>
          </div>

          {/* Actions dropdown */}
          {actions && actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "p-1 rounded-md hover:bg-accent",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  )}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Actions"
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => (
                  <React.Fragment key={index}>
                    {action.separator && index > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                      disabled={action.disabled}
                      className={cn(
                        action.variant === "destructive" &&
                          "text-destructive focus:text-destructive"
                      )}
                    >
                      {action.icon && (
                        <action.icon className="mr-2 h-4 w-4" />
                      )}
                      {action.label}
                    </DropdownMenuItem>
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Infos principales */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-base truncate">{displayName}</h3>
            <Badge
              variant="outline"
              className={cn("text-xs flex-shrink-0", statusConfig.color)}
            >
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          {employee?.department && (
            <p className="text-sm text-muted-foreground">
              Département : {employee.department}
            </p>
          )}
        </div>

        {/* Contact */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          {employee?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{employee.phone}</span>
            </div>
          )}
        </div>

        {/* Rôle */}
        <div className="mt-4 pt-4 border-t">
          <Badge variant="secondary" className="text-xs">
            {USER_ROLE_LABELS[user.role]}
          </Badge>
        </div>
      </Card>
    );
  }
);

UserCard.displayName = "UserCard";
