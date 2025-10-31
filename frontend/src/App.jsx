import { useState } from 'react';
import Swal from 'sweetalert2';
import logo from './assets/logo.webp';

const BASE_URL = "http://127.0.0.1:5000"

function App() {
  const [drImage, setDrImage] = useState(null);
  const [dmeImage, setDmeImage] = useState(null);

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({ preview: reader.result, file }); // Store both preview and file
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = (setImage, type) => {
    Swal.fire({
      title: `Clear ${type} Image?`,
      text: "This will remove the uploaded image!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, clear it!',
    }).then((result) => {
      if (result.isConfirmed) {
        setImage(null);

        // Reset file input field
        const fileInput = document.getElementById(`${type.toLowerCase()}-input`);
        if (fileInput) {
          fileInput.value = ""; // Reset the file input field
        }

        Swal.fire('Cleared!', `${type} image has been cleared.`, 'success');
      }
    });
  };

  const handleSubmit = async (image, type) => {
    if (!image) {
      Swal.fire({
        title: `No ${type} Image Uploaded!`,
        text: `Please upload a ${type} image before submitting.`,
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", image.file); // Use the actual file object

    const apiUrl = type === "DR" ? `${BASE_URL}/dr` : `${BASE_URL}/dme`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload");
      }

      const data = await response.json(); // Get JSON response from API

      Swal.fire({
        title: `${type} Image Submitted Successfully!`,
        html: `<strong>Prediction:</strong> ${data.predicted_class} <br> 
               <strong>Confidence:</strong> ${(data.confidence * 100).toFixed(2)}%`,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: `Failed to Upload ${type} Image!`,
        text: "Something went wrong, please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };


  // Function to convert base64 Data URL to File
  const dataURLtoFile = (dataUrl, filename) => {
    let arr = dataUrl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div
      style={{
        backgroundImage: "url('https://www.razumab.co.in/images/dr_dme.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <nav className="navbar navbar-dark bg-dark">
        <a className="navbar-brand" href="#">
          <img
            src={logo}
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="Logo"
            loading="lazy"
          />
          <span className="pl-5">DR and DME</span>
        </a>
      </nav>
      <div className="container mt-4">
        <div className="row">
          {/* DR Section */}
          <div className="col-sm text-center">
            <h5>Upload DR Image</h5>
            <input
              type="file"
              accept="image/*"
              id="dr-input"
              onChange={(e) => handleImageUpload(e, setDrImage)}
            />
            {drImage && (
              <div className="mt-3">
                <h6>Preview:</h6>
                <img
                  src={drImage.preview} // Use preview instead of whole object
                  alt="DR Preview"
                  className="img-thumbnail"
                  style={{ maxWidth: "100%", height: "15rem" }}
                />
              </div>
            )}
            <div className="mt-3">
              <button
                className="btn btn-success mr-2"
                onClick={() => handleSubmit(drImage, "DR")}
              >
                Submit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleClear(setDrImage, "DR")}
              >
                Clear
              </button>
            </div>
          </div>

          {/* DME Section */}
          <div className="col-sm text-center">
            <h5>Upload DME Image</h5>
            <input
              type="file"
              accept="image/*"
              id="dme-input"
              onChange={(e) => handleImageUpload(e, setDmeImage)}
            />
            {dmeImage && (
              <div className="mt-3">
                <h6>Preview:</h6>
                <img
                  src={dmeImage.preview}
                  alt="DME Preview"
                  className="img-thumbnail"
                  style={{ maxWidth: "100%", height: "15rem" }}
                />
              </div>
            )}
            <div className="mt-3">
              <button
                className="btn btn-success mr-2"
                onClick={() => handleSubmit(dmeImage, "DME")}
              >
                Submit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleClear(setDmeImage, "DME")}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

export default App;
