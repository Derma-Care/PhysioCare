export default function AttendanceReport() {
  return (
    <div className="container mt-4">

      <h3>Report</h3>

      <input type="date" className="form-control" />

      <input
        type="date"
        className="form-control mt-2"
      />

      <button className="btn btn-primary mt-2">
        Search
      </button>

    </div>
  );
}