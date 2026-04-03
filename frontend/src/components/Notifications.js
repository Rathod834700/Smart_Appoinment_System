import React from "react";

export default function Notifications({ message }) {
  if (!message) return null;
  return (
    <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded">
      {message}
    </div>
  );
}
