"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  isLoading = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex items-center justify-center gap-4">
      <Button
        onClick={onPrevious}
        disabled={currentPage === 1 || isLoading}
        variant="outline"
        size="lg"
      >
        Previous
      </Button>

      <div className="text-sm text-muted-foreground font-medium">
        Page {currentPage} of {totalPages}
      </div>

      <Button
        onClick={onNext}
        disabled={currentPage === totalPages || isLoading}
        variant="outline"
        size="lg"
      >
        Next
      </Button>
    </div>
  );
}
