import React, { useId } from "react";
import { Eye, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ProfilePrivacyToggleProps {
  isPublic: boolean;
  onToggle: (nextState: boolean) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  success?: boolean | string | null;
  error?: string | null;
}

export const ProfilePrivacyToggle: React.FC<ProfilePrivacyToggleProps> = ({
  isPublic,
  onToggle,
  disabled = false,
  loading = false,
  success = null,
  error = null,
}) => {
  const labelId = useId();
  const descId = useId();

  const isInteractiveDisabled = disabled || loading;

  const handleToggleClick = () => {
    if (isInteractiveDisabled) return;
    onToggle(!isPublic);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 py-1">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <label
              id={labelId}
              htmlFor={labelId + "-switch"}
              className="text-sm font-semibold text-slate-100 select-none flex items-center gap-1.5"
            >
              {isPublic ? (
                <Eye className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-4 h-4 text-amber-400" />
              )}
              Profile Visibility
            </label>
            <Badge
              variant={isPublic ? "success" : "outline"}
              className={`text-[10px] uppercase font-bold py-0 px-2 ${
                isPublic
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-800 text-gray-400 border-gray-700"
              }`}
            >
              {isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          <span
            id={descId}
            className="text-xs text-gray-400 select-none leading-relaxed max-w-md"
          >
            {isPublic
              ? "Your profile is visible in the teammate marketplace and public AI recommendations."
              : "Your profile is private and hidden from marketplace search and public recommendations."}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {loading && (
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          )}

          <button
            id={labelId + "-switch"}
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-labelledby={labelId}
            aria-describedby={descId}
            aria-disabled={isInteractiveDisabled}
            disabled={isInteractiveDisabled}
            onClick={handleToggleClick}
            className={`
              relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent
              transition-colors duration-200 ease-in-out
              focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-offset-navy-950
              ${isPublic ? "bg-emerald-500" : "bg-slate-700"}
            `}
          >
            <span className="sr-only">Toggle profile visibility</span>
            <span
              aria-hidden="true"
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0
                transition-transform duration-200 ease-in-out
                ${isPublic ? "translate-x-5" : "translate-x-0"}
              `}
            />
          </button>
        </div>
      </div>

      {/* Success Notification State */}
      {success && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>
            {typeof success === "string"
              ? success
              : isPublic
              ? "Profile is now public and discoverable in the marketplace."
              : "Profile is now private and hidden from discovery."}
          </span>
        </div>
      )}

      {/* Error Notification State */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
