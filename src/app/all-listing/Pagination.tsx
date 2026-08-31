type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex items-center justify-center gap-3 pt-2 text-lg text-slate-600">
      {currentPage > 1 ? (
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
          aria-label="Previous page"
        >
          ‹
        </button>
      ) : (
        <span className="h-9 w-9" aria-hidden="true" />
      )}

      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition ${
            pageNumber === currentPage
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {pageNumber}
        </button>
      ))}

      {currentPage < totalPages ? (
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
          aria-label="Next page"
        >
          ›
        </button>
      ) : (
        <span className="h-9 w-9" aria-hidden="true" />
      )}
    </div>
  );
}
