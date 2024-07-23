import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CameraComponent = () => {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [devices, setDevices] = useState([]);
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);

  const handleDevices = (mediaDevices) => {
    setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));
  };

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, []);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: { exact: "environment" }, // Request the rear camera
  };

  const uploadToCloudinary = async (base64Image) => {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const data = {
      file: base64Image,
      upload_preset: uploadPreset,
    };

    try {
      const response = await axios.post(url, data);
      console.log("Cloudinary response:", response.data);
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      return null;
    }
  };

  const capture = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      console.log("Captured image source:", imageSrc);
      setImageSrc(imageSrc);

      const cloudinaryUrl = await uploadToCloudinary(imageSrc);
      if (cloudinaryUrl) {
        console.log("Uploaded to Cloudinary:", cloudinaryUrl);
        setCloudinaryUrl(cloudinaryUrl);
      }
    } else {
      console.error("Webcam reference is null");
    }
  };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        // width={320} // Set the desired width
        // height={240}
      />
      <button onClick={capture}>Capture photo</button>
      {imageSrc && (
        <div>
          <h2>Preview</h2>
          <img src={imageSrc} alt="Captured" />
        </div>
      )}
      {cloudinaryUrl && (
        <div>
          <h2>Uploaded Image URL</h2>
          <a href={cloudinaryUrl} target="_blank" rel="noopener noreferrer">
            {cloudinaryUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
