"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Star, Sparkles, CheckCircle2, AlertCircle, ShieldAlert, Loader2 } from "lucide-react";
import { submitReview, checkReviewEligibility } from "@/lib/supabase/data-service";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewerId: string;
  targetId: string;
  targetName: string;
  sessionId?: string;
  onReviewSubmitted?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  reviewerId,
  targetId,
  targetName,
  sessionId,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason?: string }>({ eligible: true });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isSelf = reviewerId === targetId;

  useEffect(() => {
    if (isOpen && reviewerId && targetId) {
      if (isSelf) {
        setEligibility({ eligible: false, reason: "You cannot leave a review for your own profile." });
        setCheckingEligibility(false);
        return;
      }

      setCheckingEligibility(true);
      checkReviewEligibility(reviewerId, targetId, sessionId)
        .then((res) => setEligibility(res))
        .finally(() => setCheckingEligibility(false));
    }
  }, [isOpen, reviewerId, targetId, isSelf, sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSelf) {
      setErrorMessage("Cannot submit a review for yourself.");
      return;
    }
    if (!eligibility.eligible) {
      setErrorMessage(eligibility.reason || "You are not eligible to review this user.");
      return;
    }
    if (!comment.trim()) {
      setErrorMessage("Please provide written feedback for your peer.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await submitReview({
      reviewerId,
      targetId,
      sessionId,
      rating,
      comment: comment.trim(),
    });

    setLoading(false);

    if (!res.success) {
      if (!isSupabaseConfigured) {
        // Fallback for unconfigured preview
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setComment("");
          if (onReviewSubmitted) onReviewSubmitted();
        }, 1200);
        return;
      }
      setErrorMessage(res.error || "Failed to submit review.");
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setComment("");
        if (onReviewSubmitted) onReviewSubmitted();
      }, 1200);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <span className="text-lg font-bold text-white">Rate &amp; Review Collaboration</span>
        </div>
      }
      description={`Share verified feedback for your technical collaboration with ${targetName}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {checkingEligibility && (
          <div className="p-3 rounded-lg bg-gray-950/60 border border-gray-800 text-gray-400 text-xs flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span>Verifying collaboration eligibility...</span>
          </div>
        )}

        {!checkingEligibility && !eligibility.eligible && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold block text-amber-200">Review Eligibility Notice</span>
              <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
                {eligibility.reason}
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Thank you! Your feedback has been verified and recorded.</span>
          </div>
        )}

        {/* Interactive Star Rating */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-2">
            Overall Rating
          </label>
          <div className="flex items-center gap-1.5 p-3 rounded-xl bg-gray-950/80 border border-gray-800 w-fit">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = hoverRating ? star <= hoverRating : star <= rating;
              return (
                <button
                  key={star}
                  type="button"
                  disabled={!eligibility.eligible}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform disabled:opacity-50"
                >
                  <Star
                    className={`w-6 h-6 ${
                      active
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-600 hover:text-gray-500"
                    }`}
                  />
                </button>
              );
            })}
            <span className="ml-2 text-xs font-bold text-amber-300">
              {hoverRating || rating}.0 / 5.0
            </span>
          </div>
        </div>

        {/* Written Review */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1.5">
            Feedback &amp; Collaboration Comments
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={!eligibility.eligible}
            rows={4}
            placeholder={`Highlight what went well, how clearly ${targetName} communicated, and their technical contributions...`}
            className="w-full rounded-xl border border-gray-700 bg-gray-950 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="purple"
            size="sm"
            disabled={loading || !comment.trim() || !eligibility.eligible}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1" />
            )}
            Publish Verified Review
          </Button>
        </div>
      </form>
    </Modal>
  );
}
