

const Pagination = ({ page, totalPages, onChange }) => {
  // nothing to show when there is only one page
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button className="btn btn-light" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </button>
      <span>Page {page} of {totalPages}</span>
      <button className="btn btn-light" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
