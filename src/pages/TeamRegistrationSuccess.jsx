import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button, message } from "antd"; // Assuming Ant Design Button and message
import { Link, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";

const TeamRegistrationSuccess = () => {
  const location = useLocation();
  const registeredTeams = location.state?.registeredTeams || [];
  const pdfBase64 = location.state?.pdfBase64 || null; // <--- Get pdfBase64 from state
  const pdfFileName = location.state?.pdfFileName || "Team_Registration_Details.pdf"; // <--- Get pdfFileName from state

  console.log('Registered teams:', registeredTeams);
  console.log('PDF Base64 received:', pdfBase64 ? 'Yes' : 'No');
  console.log('PDF File Name received:', pdfFileName);


  const handleDownloadPDF = () => {
    // Check if pdfBase64 is available in state
    if (pdfBase64) {
      // Decode base64 to a binary string
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create a link element, set its href to the Blob URL, and click it to trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = pdfFileName; // Use the provided filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href); // Clean up the Blob URL

      message.success("Registration details PDF downloaded successfully!");
    } else {
      // Fallback or alert if PDF data is not available
      message.error("No PDF details available for download. Please check your email for confirmation.");
      // You could optionally keep the old download logic here if you still have a single-team PDF endpoint
      // OR direct them to check email / contact support.
      // E.g., if you still want the single team download as a fallback:
      // if (registeredTeams.length > 0 && registeredTeams[0].teamRegId) {
      //   const team = registeredTeams[0];
      //   const url = `${import.meta.env.VITE_API_BASE_URL}/team/pdf/${team.teamRegId}`;
      //   window.open(url, "_blank");
      //   message.info("Attempting to download individual team PDF as a fallback.");
      // }
    }
  };

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
    message.success("Email confirmation has been sent to school and coordinator.");

    // Optional: Auto-download the PDF on success page load
    // if (pdfBase64) {
    //   handleDownloadPDF();
    // }

  }, []); // Empty dependency array means this runs once on mount

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

        {registeredTeams.length > 0 ? (
          <div className="my-6">
            <p className="text-gray-800 text-xl font-semibold mb-2">
              Registered Team IDs:
            </p>
            <ul className="flex flex-wrap justify-center gap-4">
              {registeredTeams.map((team, idx) => (
                <li key={team.teamRegId || idx} className="bg-blue-100 px-4 py-2 rounded-md font-mono text-lg tracking-wide text-blue-700 flex flex-col items-center">
                  <span className="font-semibold text-xs text-gray-500 mb-1">Team {team.teamNumber || idx + 1}</span>
                  <span>{team.teamRegId ? team.teamRegId : 'N/A'}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="my-6 text-gray-600">No team details available.</div>
        )}

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
            // Optional: Disable button if no PDF data is available
            // disabled={!pdfBase64}
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