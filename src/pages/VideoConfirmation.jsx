import React from "react";

const VideoConfirmation = () => (
  <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center", padding: 32, background: "#f6ffed", borderRadius: 12, boxShadow: "0 2px 8px #e6f7ff" }}>
    <h1 style={{ color: "#52c41a", fontSize: 32, marginBottom: 16 }}>Video Submitted Successfully!</h1>
    <p style={{ fontSize: 18, marginBottom: 24 }}>
      Thank you for submitting your team's video.<br/>
      Your submission has been received and is currently under review.
    </p>
    <p style={{ fontSize: 16, marginBottom: 24 }}>
      We appreciate your effort and enthusiasm. Please be patient while our evaluation team goes through all entries. Results will be announced soon!
    </p>
    <p style={{ fontSize: 16, marginBottom: 24 }}>
      👉 In the meantime, feel free to explore more about our events, success stories, and other exciting opportunities on our website.
    </p>
    <p style={{ fontSize: 18, color: "#1890ff" }}>Stay tuned, and best of luck! 🚀</p>
  </div>
);

export default VideoConfirmation; 