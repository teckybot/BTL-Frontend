import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "antd";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";

const TeamRegistrationSuccess = () => {
  const teamRegId = sessionStorage.getItem("teamRegId");

  const handleDownloadPDF = () => {
    if (!teamRegId) {
      alert("Missing Team ID. Please check your email.");
      return;
    }
    const url = `${import.meta.env.VITE_API_BASE_URL}/team/pdf/${teamRegId}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center px-4">
      <motion.div
        className="bg-white shadow-2xl rounded-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-10 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex justify-center mb-4"
        >
          <CheckCircle className="text-green-500" size={60} />
        </motion.div>

        <h1 className="text-3xl font-bold text-blue-700 mb-2">
          Team Registration Successful!
        </h1>

        <p className="text-gray-700 text-lg">
          Your team has been successfully registered for <strong>Bharat Tech League 2025</strong>.
        </p>

        <div className="my-6">
          <p className="text-gray-800 text-xl font-semibold">
            Your Team ID is:
          </p>
          <p className="text-blue-700 bg-blue-100 inline-block px-4 py-1 mt-1 rounded-md font-mono text-lg tracking-wide">
            {teamRegId || 'N/A'}
          </p>
        </div>

        <p className="text-gray-600 mb-6">
          A confirmation email has been sent to the coordinator's email. You can also download your team registration details below.
        </p>

        <div className="bg-blue-50 p-4 rounded-md text-left mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Next Steps:</h2>
          <ul className="list-disc list-inside text-gray-700 text-sm space-y-2">
            <li>Keep your Team ID safe for future reference</li>
            <li>Check your email for important updates about the competition</li>
            <li>Start preparing for your selected event category</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            type="primary"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            onClick={handleDownloadPDF}
          >
            Download Registration Details
          </Button>
          <Link to="/">
            <Button className="border border-blue-500 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded">
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamRegistrationSuccess;