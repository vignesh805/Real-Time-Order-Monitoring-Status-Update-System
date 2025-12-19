import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./Track.css";

const socket = io("http://localhost:4000");

const stages = [
  "PLACED",
  "ACCEPTED",
  "PACKED",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

export default function Track({ orderId }) {
  const [currentStatus, setCurrentStatus] = useState("PLACED");

  useEffect(() => {
    socket.on("orderStatusUpdated", data => {
      if (data.orderId === orderId) {
        setCurrentStatus(data.status);
      }
    });

    return () => socket.off("orderStatusUpdated");
  }, [orderId]);

  const currentIndex = stages.indexOf(currentStatus);

  return (
    <div className="tracking-page">
      <h2>Order Tracking</h2>

      <p className="eta">
        Estimated delivery: <strong>30 mins</strong>
      </p>

      <div className="timeline">
        {stages.map((stage, index) => (
          <div key={stage} className="timeline-item">
            <div
              className={`dot ${
                index === currentIndex
                  ? "active pulse"
                  : index < currentIndex
                  ? "done"
                  : ""
              }`}
            />
            <p>{stage.replaceAll("_", " ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
