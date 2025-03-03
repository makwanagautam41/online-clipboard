import { useState, useContext } from "react";
import { uploadImage, retrieveImage } from "../api";
import { ClipboardContext } from "../context/ClipboardContext";
import { FaSpinner, FaDownload } from "react-icons/fa";

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [code, setCode] = useState(""); // Code from upload
  const [retrieveCode, setRetrieveCode] = useState(""); // Separate input for retrieval
  const [uploading, setUploading] = useState(false);
  const [retrieving, setRetrieving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { retrievedData, setRetrievedData } = useContext(ClipboardContext);

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select an image!");
      return;
    }

    setUploading(true);
    setErrorMessage("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const data = await uploadImage(formData);
      setCode(data.code);
      setRetrieveCode(""); // Reset retrieval input on new upload
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrorMessage("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRetrieve = async () => {
    setRetrieving(true);
    setErrorMessage("");
    setDownloading(false);
    try {
      const data = await retrieveImage(retrieveCode);
      if (!data.imageUrl) {
        setRetrievedData("");
        setErrorMessage("Image not found. Please enter a valid code.");
      } else {
        setRetrievedData(data.imageUrl);
      }
    } catch (error) {
      console.error("Error retrieving image:", error);
      setRetrievedData("");
      setErrorMessage("Image not found. Please enter a valid code.");
    } finally {
      setRetrieving(false);
    }
  };

  const handleDownload = () => {
    if (!retrievedData) {
      setErrorMessage("Image not found. Please enter a valid code.");
      return;
    }

    setDownloading(true);
    setTimeout(() => setDownloading(false), 2000);

    const link = document.createElement("a");
    link.href = retrievedData;
    link.download = "image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-md mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center text-blue-400">
        Image Clipboard
      </h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="w-full p-3 mt-4 border rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <button
        onClick={handleUpload}
        className="w-full mt-3 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center"
        disabled={uploading}
      >
        {uploading ? (
          <FaSpinner className="animate-spin mr-2" />
        ) : (
          "Upload Image"
        )}
      </button>

      {code && (
        <p className="text-green-400 font-semibold text-center mt-2">
          Your Code: {code}
        </p>
      )}

      <hr className="my-4 border-gray-600" />

      <h2 className="text-lg font-semibold text-white text-center">
        Retrieve Image
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
        <div className="mt-4 p-3 bg-gray-700 text-white rounded-md">
          <h3 className="font-semibold text-center">Retrieved Image:</h3>
          <img
            src={retrievedData}
            alt="Retrieved"
            className="w-full mt-3 rounded-md"
          />

          <button
            onClick={handleDownload}
            className={`w-full mt-3 py-2 rounded-md flex items-center justify-center transition ${
              downloading
                ? "bg-green-500 hover:bg-green-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {downloading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaDownload className="mr-2" />
            )}
            {downloading ? "Downloading..." : "Download Image"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
