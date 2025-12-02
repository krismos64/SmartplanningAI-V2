"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TeamMember, USER_STATUS_CONFIG } from "./types";

/**
 * AvatarStack - Affichage groupé d'avatars avec overlap
 *
 * SP-123 : Composants métier SmartPlanning
 *
 * Features :
 * - Avatars empilés avec overlap (-ml-2)
 * - Counter "+X" si > max
 * - Points de statut optionnels
 * - Tooltips avec noms
 * - Tailles sm/md
 *
 * @example
 * ```tsx
 * <AvatarStack
 *   members={teamMembers}
 *   max={5}
 *   showStatus
 * />
 * ```
 */

export interface AvatarStackProps {
  /** Liste des membres à afficher */
  members: TeamMember[];

  /** Nombre maximum d'avatars visibles (default: 5) */
  max?: number;

  /** Taille des avatars */
  size?: "sm" | "md";

  /** Afficher les points de statut */
  showStatus?: boolean;

  /** Classes CSS additionnelles */
  className?: string;
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
 * Configuration des tailles
 */
const SIZE_CONFIG = {
  sm: {
    avatar: "h-8 w-8",
    overlap: "-ml-2",
    counter: "h-8 w-8 text-xs",
    statusDot: "h-2 w-2 -bottom-0 -right-0",
  },
  md: {
    avatar: "h-10 w-10",
    overlap: "-ml-3",
    counter: "h-10 w-10 text-sm",
    statusDot: "h-2.5 w-2.5 -bottom-0.5 -right-0.5",
  },
} as const;

/**
 * Obtient la config du statut avec fallback
 */
function getStatusConfig(status: string | undefined) {
  if (!status || !(status in USER_STATUS_CONFIG)) {
    return USER_STATUS_CONFIG.active;
  }
  return USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG];
}

export const AvatarStack = React.forwardRef<HTMLDivElement, AvatarStackProps>(
  ({ members, max = 5, size = "sm", showStatus = false, className }, ref) => {
    const config = SIZE_CONFIG[size];
    const visibleMembers = members.slice(0, max);
    const remainingCount = members.length - max;

    return (
      <TooltipProvider delayDuration={300}>
        <div ref={ref} className={cn("flex items-center", className)}>
          {visibleMembers.map((member, index) => (
            <Tooltip key={member.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "relative",
                    index > 0 && config.overlap,
                    "transition-transform hover:z-10 hover:scale-110"
                  )}
                >
                  <Avatar
                    className={cn(
                      config.avatar,
                      "border-2 border-background ring-0"
                    )}
                  >
                    {member.image && (
                      <AvatarImage
                        src={member.image}
                        alt={member.name || "Membre"}
                      />
                    )}
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Point de statut */}
                  {showStatus && member.status && (
                    <span
                      className={cn(
                        "absolute rounded-full border-2 border-background",
                        config.statusDot,
                        getStatusConfig(member.status).dotColor
                      )}
                      aria-label={getStatusConfig(member.status).label}
                    />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p>{member.name || "Sans nom"}</p>
                {member.status && (
                  <p className="text-muted-foreground">
                    {getStatusConfig(member.status).label}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Counter "+X" */}
          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    config.overlap,
                    config.counter,
                    "flex items-center justify-center rounded-full",
                    "bg-muted text-muted-foreground font-medium",
                    "border-2 border-background",
                    "cursor-default"
                  )}
                >
                  +{remainingCount}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p>
                  {remainingCount} autre{remainingCount > 1 ? "s" : ""} membre
                  {remainingCount > 1 ? "s" : ""}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  }
);

AvatarStack.displayName = "AvatarStack";
