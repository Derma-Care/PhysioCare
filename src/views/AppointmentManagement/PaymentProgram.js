import React, { useState } from "react";

export const dummyPrograms = [
    {
        id: 1,
        programName: "Knee Rehab Program",
        therapies: [
            {
                therapyName: "Strength Therapy",
                exercises: [
                    {
                        name: "Squats",
                        sessionCost: 100,
                        sessions: [
                            { date: "2026-04-05", sets: 3, reps: 10, doneSets: 2, doneReps: 8 },
                            { date: "2026-04-06", sets: 3, reps: 10, doneSets: 3, doneReps: 10 },
                        ],
                    },
                    {
                        name: "Leg Raise",
                        sessionCost: 80,
                        sessions: [
                            { date: "2026-04-07", sets: 2, reps: 12, doneSets: 2, doneReps: 10 },
                        ],
                    },
                ],
            },
        ],
    },
];

export default function PaymentAccordion() {
    const [serviceType, setServiceType] = useState("program");
    const [discount, setDiscount] = useState(0);
    const [paymentType, setPaymentType] = useState("full");

    const calculateExerciseTotal = (exercise) => {
        return exercise.sessions.length * exercise.sessionCost;
    };

    const calculateProgramTotal = (program) => {
        let total = 0;
        program.therapies.forEach((therapy) => {
            therapy.exercises.forEach((ex) => {
                total += calculateExerciseTotal(ex);
            });
        });
        return total;
    };

    const getFinalAmount = (amount) => {
        return amount - (amount * discount) / 100;
    };

    const getPayable = (amount) => {
        if (paymentType === "partial") return amount * 0.5;
        return amount;
    };

    const isSunday = (date) => {
        return new Date(date).getDay() === 0;
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Payment Module</h2>

            {/* Service Type */}
            <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
            >
                <option value="program">Program</option>
                <option value="package">Package</option>
            </select>

            {dummyPrograms.map((program) => {
                const programTotal = calculateProgramTotal(program);
                const finalAmount = getFinalAmount(programTotal);
                const payable = getPayable(finalAmount);

                return (
                    <details key={program.id} style={{ marginTop: 10 }}>
                        <summary style={{ fontWeight: "bold" }}>
                            {program.programName}
                        </summary>

                        {program.therapies.map((therapy, tIndex) => (
                            <details key={tIndex} style={{ marginLeft: 20 }}>
                                <summary>{therapy.therapyName}</summary>

                                {therapy.exercises.map((exercise, eIndex) => {
                                    const exerciseTotal = calculateExerciseTotal(exercise);

                                    return (
                                        <details key={eIndex} style={{ marginLeft: 20 }}>
                                            <summary>
                                                {exercise.name} - ₹{exercise.sessionCost}/session
                                            </summary>

                                            <table border="1" cellPadding="5">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Sets</th>
                                                        <th>Reps</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {exercise.sessions.map((s, i) =>
                                                        isSunday(s.date) ? null : (
                                                            <tr key={i}>
                                                                <td>{s.date}</td>
                                                                <td>
                                                                    {s.doneSets}/{s.sets}
                                                                </td>
                                                                <td>
                                                                    {s.doneReps}/{s.reps}
                                                                </td>
                                                                <td>
                                                                    {s.doneSets === s.sets &&
                                                                        s.doneReps === s.reps
                                                                        ? "Completed"
                                                                        : "Pending"}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>

                                            <p>Total Exercise Cost: ₹{exerciseTotal}</p>
                                        </details>
                                    );
                                })}
                            </details>
                        ))}

                        {/* Summary */}
                        <div style={{ marginTop: 10 }}>
                            <p>Program Total: ₹{programTotal}</p>

                            <label>Discount %:</label>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                            />

                            <p>After Discount: ₹{finalAmount}</p>

                            <label>Payment Type:</label>
                            <select
                                value={paymentType}
                                onChange={(e) => setPaymentType(e.target.value)}
                            >
                                <option value="full">Full</option>
                                <option value="partial">Partial (50%)</option>
                            </select>

                            <h3>Payable Amount: ₹{payable}</h3>
                        </div>
                    </details>
                );
            })}
        </div>
    );
}