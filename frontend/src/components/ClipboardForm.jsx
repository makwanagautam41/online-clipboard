import { useState, useContext } from "react";
import { saveText, retrieveText } from "../api";
import { ClipboardContext } from "../context/ClipboardContext";
import { FaSpinner, FaClipboard, FaCheck } from "react-icons/fa";

const ClipboardForm = () => {
  const [text, setText] = useState("");
  const [code, setCode] = useState(""); // Code generated from saving
  const [retrieveCode, setRetrieveCode] = useState(""); // Separate input for retrieval
  const [saving, setSaving] = useState(false);
  const [retrieving, setRetrieving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const { retrievedData, setRetrievedData } = useContext(ClipboardContext);

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage("");
    try {
      const data = await saveText(text);
      setCode(data.code);
      setRetrieveCode(""); // Reset retrieval input on new save
    } catch (error) {
      console.error("Error saving text:", error);
      setErrorMessage("Failed to save text");
    } finally {
      setSaving(false);
    }
  };

  const handleRetrieve = async () => {
    setRetrieving(true);
    setErrorMessage("");
    setCopied(false);
    try {
      const data = await retrieveText(retrieveCode);
      if (!data.text) {
        setRetrievedData(null);
        setErrorMessage("No data found or Invalid Code");
      } else {
        setRetrievedData(data.text);
      }
    } catch (error) {
      console.error("Error retrieving text:", error);
      setRetrievedData(null);
      setErrorMessage("No data found or Invalid Code");
    } finally {
      setRetrieving(false);
    }
  };

  const handleCopy = () => {
    if (retrievedData) {
      navigator.clipboard.writeText(retrievedData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-md mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center text-blue-400">
        Text Clipboard
      </h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text here..."
        className="w-full p-3 mt-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 h-40 bg-gray-700 text-white resize-none"
        required
      ></textarea>

      <button
        onClick={handleSave}
        className="w-full mt-3 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center"
        disabled={saving}
      >
        {saving ? <FaSpinner className="animate-spin mr-2" /> : "Generate Code"}
      </button>

      {code && (
        <p className="text-green-400 font-semibold text-center mt-2">
          Your Code: {code}
        </p>
      )}

      <hr className="my-4 border-gray-600" />

      <h2 className="text-lg font-semibold text-white text-center">
        Retrieve Data
      </h2>

      <input
        type="text"
        value={retrieveCode}
        onChange={(e) => setRetrieveCode(e.target.value)}
        placeholder="Enter 4-digit code"
        className="w-full p-3 mt-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-700 text-white"
        required
      />

      <button
        onClick={handleRetrieve}
        className="w-full mt-3 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition flex items-center justify-center"
        disabled={retrieving}
      >
        {retrieving ? <FaSpinner className="animate-spin mr-2" /> : "Retrieve"}
      </button>

      {errorMessage && (
        <p className="text-red-400 font-semibold text-center mt-2">
          {errorMessage}
        </p>
      )}

      {retrievedData && (
        <div className="mt-4 p-3 bg-gray-700 text-white rounded-md break-all">
          <h3 className="font-semibold text-center">Retrieved Text:</h3>
          <p>{retrievedData}</p>

          <button
            onClick={handleCopy}
            className={`w-full mt-3 py-2 rounded-md flex items-center justify-center transition ${
              copied
                ? "bg-green-500 hover:bg-green-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {copied ? (
              <FaCheck className="mr-2" />
            ) : (
              <FaClipboard className="mr-2" />
            )}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ClipboardForm;
