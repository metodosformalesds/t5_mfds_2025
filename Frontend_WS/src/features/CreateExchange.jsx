import { useState } from "react";
import "./CreateExchange.css";

const CreateExchange = () => {
  const [formData, setFormData] = useState({
    plant_common_name: "",
    plant_scientific_name: "",
    description: "",
    width_cm: "",
    height_cm: "",
    location: "",
    image1: null,
    image2: null,
    image3: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    console.log("FORM READY TO SEND:", data);
    alert("Intercambio listo para enviarse al backend!");
  };

  return (
    <div className="create-exchange-page">
      <div className="shop-header">
        <h1>Create exchange</h1>
        <p>Create a new exchange for other people to find out</p>
      </div>

      <div className="exchange-form-container">
        <form className="exchange-form" onSubmit={handleSubmit}>
          <label>Plant Common Name</label>
          <input
            type="text"
            name="plant_common_name"
            placeholder="e.g. Spider Plant"
            value={formData.plant_common_name}
            onChange={handleChange}
            required
          />

          <label>Plant Scientific Name</label>
          <input
            type="text"
            name="plant_scientific_name"
            placeholder="e.g. Chlorophytum comosum"
            value={formData.plant_scientific_name}
            onChange={handleChange}
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            placeholder="Describe the plant, condition, care needs, etc."
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>

          <div className="dimension-row">
            <div>
              <label>Width (cm)</label>
              <input
                type="number"
                name="width_cm"
                placeholder="e.g. 30"
                value={formData.width_cm}
                onChange={handleChange}
                step="0.1"
                min="0"
              />
            </div>

            <div>
              <label>Height (cm)</label>
              <input
                type="number"
                name="height_cm"
                placeholder="e.g. 45"
                value={formData.height_cm}
                onChange={handleChange}
                step="0.1"
                min="0"
              />
            </div>
          </div>

          <label>Location</label>
          <textarea
            name="location"
            placeholder="Neighborhood or area for delivery/exchange"
            value={formData.location}
            onChange={handleChange}
            required
          ></textarea>

          <label>Image 1</label>
          <input type="file" name="image1" accept="image/*" onChange={handleChange} />

          <label>Image 2</label>
          <input type="file" name="image2" accept="image/*" onChange={handleChange} />

          <label>Image 3</label>
          <input type="file" name="image3" accept="image/*" onChange={handleChange} />

          <button type="submit" className="submit-exchange-btn">
            Publish Exchange ($90 MXN)
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateExchange;
