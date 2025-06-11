import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "antd";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";

const RegistrationSuccess = () => {
  const schoolRegId = sessionStorage.getItem("schoolRegId");

  const handleDownloadPDF = () => {
    if (!schoolRegId) {
      alert("Missing School ID. Please check your email.");
      return;
    }
    const url = `${import.meta.env.VITE_API_BASE_URL}/school/pdf/${schoolRegId}`;
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
        {/* <motion.img
          src="/success-illustration.svg"
          alt="Success Illustration"
          className="w-32 mx-auto mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        /> */}

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex justify-center mb-4"
        >
          <CheckCircle className="text-green-500" size={60} />
        </motion.div>

        <h1 className="text-3xl font-bold text-blue-700 mb-2">
          School Registration Successful!
        </h1>

        <p className="text-gray-700 text-lg">
          Thank you for registering your school for <strong>Bharat Tech League 2025</strong>.
        </p>

        <div className="my-6">
          <p className="text-gray-800 text-xl font-semibold">
            Your School Registration ID is:
          </p>
          <p className="text-blue-700 bg-blue-100 inline-block px-4 py-1 mt-1 rounded-md font-mono text-lg tracking-wide">
            {schoolRegId || 'N/A'}
          </p>
        </div>

        <p className="text-gray-600 mb-6">
          A confirmation email has been sent to your school email. You can also download your registration PDF below.
        </p>

        <div className="bg-blue-50 p-4 rounded-md text-left mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Instructions:</h2>
          <ul className="list-disc list-inside text-gray-700 text-sm">
            <li>Please share this School ID with your students. They’ll need it to register.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            type="primary"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            onClick={handleDownloadPDF}
          >
            Download PDF
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

export default RegistrationSuccess;
