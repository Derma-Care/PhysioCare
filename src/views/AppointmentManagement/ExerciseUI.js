import React from "react";
import { CButton } from "@coreui/react";
import { FONT_SIZES } from "../../Constant/Themes";

const ExerciseUI = ({ exercise }) => {
  return (
    <div
      style={{
        background: "#f9fafb",
        padding: "12px",
        borderRadius: "10px",
        marginTop: "10px",
        border: "1px solid #eee",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong style={{ fontSize: FONT_SIZES.sm }}>
          {exercise.exerciseName}
        </strong>

        <span
          style={{
            fontSize: FONT_SIZES.sm,
            fontWeight: 600,
            color: "#6c757d",
          }}
        >
          ₹{exercise.pricePerSession}/Session
        </span>
      </div>

      <div className="d-flex flex-wrap gap-2">
        {(exercise.sessions || []).map((session, si) => {
          const status = session.paymentStatus?.toLowerCase();

          return (
            <CButton
              key={si}
              size="sm"
              disabled={status === "paid"}
              style={{
                borderRadius: "20px",
                padding: "4px 10px",
                fontSize: FONT_SIZES.xs,
                fontWeight: 600,
                border:
                  status === "paid"
                    ? "none"
                    : status === "partial"
                    ? "1px solid #ffc107"
                    : "1px solid #dc3545",
                backgroundColor:
                  status === "paid"
                    ? "#198754"
                    : status === "partial"
                    ? "#fff3cd"
                    : "#fff",
                color:
                  status === "paid"
                    ? "#fff"
                    : status === "partial"
                    ? "#856404"
                    : "#dc3545",
              }}
            >
              {status === "paid"
                ? "✓ Paid"
                : status === "partial"
                ? "Partial"
                : `${session.sessionId}`}
            </CButton>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseUI;
