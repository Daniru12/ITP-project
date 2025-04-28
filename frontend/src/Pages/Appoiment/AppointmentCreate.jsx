import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import HamsterLoader from "../../components/HamsterLoader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AppointmentCreate = () => {
  const [formData, setFormData] = useState({
    pet_id: "",
    service_id: "",
    appointment_date: "",
    package_type: "basic",
    special_notes: "",
    usePoints: false,
  });
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        toast.error("You're not logged in.");
        window.location.href = "/login";
        return;
      }
      try {
        const petRes = await axios.get(`${backendUrl}/api/users/pets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const petsArray = Array.isArray(petRes.data)
          ? petRes.data
          : petRes.data.pets || [];
        setPets(petsArray);
      } catch (err) {
        console.error("Error loading pets:", err.response?.data || err.message);
        toast.error("Failed to load pets");
        setPets([]);
      }
      try {
        let servicesArray = [];
        if (id) {
          const serviceRes = await axios.get(
            `${backendUrl}/api/users/service/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const singleService = serviceRes.data?.service;
          if (singleService) {
            servicesArray = [singleService];
            setFormData((prev) => ({ ...prev, service_id: singleService._id }));
          }
        }
        setServices(servicesArray);
      } catch (err) {
        console.error(
          "Error loading services:",
          err.response?.data || err.message
        );
        toast.error("Failed to load services");
        setServices([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [backendUrl, token, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    const selectedDate = new Date(formData.appointment_date);
    const now = new Date();
    if (selectedDate < now) {
      toast.error("You can't select a past date/time.");
      setSubmitLoading(false);
      return;
    }
    try {
      // Get current loyalty points before booking
      const userResponse = await axios.get(`${backendUrl}/api/users/loyalty-points`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const currentPoints = userResponse.data.points;
      const possibleDiscount = userResponse.data.possibleDiscount;

      // Only proceed with points if user has enough and wants to use them
      if (formData.usePoints) {
        if (!currentPoints || currentPoints < 20) {
          toast.error("You need at least 20 points to get a discount");
          setSubmitLoading(false);
          return;
        }
        toast.success(`You have ${currentPoints} points available for a $${possibleDiscount} discount!`);
      }

      // Create the appointment
      const response = await axios.post(
        `${backendUrl}/api/appointments/create`,
        {
          ...formData,
          pet_id: formData.pet_id,
          service_id: services[0]?._id,
          appointment_date: formData.appointment_date,
          package_type: formData.package_type,
          special_notes: formData.special_notes,
          usePoints: formData.usePoints
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Appointment booked successfully!");
      if (response.data.pointsUsed > 0) {
        toast.success(`Used ${response.data.pointsUsed} points for a $${response.data.discountApplied} discount!`);
      }

      setFormData({
        pet_id: "",
        service_id: "",
        appointment_date: "",
        package_type: "basic",
        special_notes: "",
        usePoints: false,
      });
      
      setTimeout(() => {
        navigate("/Appointment");
      }, 1000);
    } catch (err) {
      console.error("Booking error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setSubmitLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  if (loading) {
    return <HamsterLoader />;
  }

  // Package details for better visual description
  const packageDetails = {
    basic: {
      icon: "🐾",
      name: "Basic Care",
      description: "Essential care and basic grooming for your pet",
      features: ["Basic grooming", "Standard bath", "Nail trimming"],
    },
    premium: {
      icon: "⭐",
      name: "Premium Care",
      description: "Advanced grooming with specialty products",
      features: [
        "Deep cleaning",
        "Premium shampoo",
        "Styling",
        "Teeth cleaning",
      ],
    },
    luxury: {
      icon: "👑",
      name: "Luxury Care",
      description: "Complete spa treatment with premium services",
      features: [
        "Spa treatment",
        "Massage therapy",
        "Specialty styling",
        "Aromatherapy",
        "Take-home products",
      ],
    },
  };

  return (
    <div
      className="min-h-screen py-8 px-4 md:px-8"
      style={{ backgroundColor: "#f9f6f2" }}
    >
      <div
        className="max-w-full mx-auto rounded-2xl overflow-hidden shadow-xl"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {/* Top Banner */}
        <div className="relative h-40 overflow-hidden">
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: "url('/pet-banner-bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.7)",
            }}
          >
            {/* Fallback image if the url doesn't work */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, rgba(188, 70, 38, 0.85) 0%, rgba(223, 165, 93, 0.85) 100%)`,
                mixBlendMode: "multiply",
              }}
            />
          </div>
          <div className="relative z-10 h-full flex items-center px-8">
            <div className="flex items-center">
              <div className="bg-white p-3 rounded-full shadow-lg">
                <img
                  src={
                    services[0]?.image && services[0]?.image.length > 0
                      ? services[0].image[0]
                      : "/logo.png"
                  }
                  alt={services[0]?.service_name || "Service Logo"}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>

              <div className="ml-5 text-white">
                <h1 className="text-3xl font-bold">
                  {services[0]?.service_name || "Book Your Pet's Appointment"}
                </h1>
                <p className="text-white text-opacity-90 mt-1">
                  Give your furry friend the care they deserve
                </p>
              </div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Left Column - Pet Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
                <h2
                  className="text-xl font-bold mb-5"
                  style={{ color: "#BC4626" }}
                >
                  Your Pets
                </h2>
                {/* Pet Selection */}
                <div className="mb-6">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#347486" }}
                  >
                    Select Pet for Appointment
                  </label>
                  <select
                    name="pet_id"
                    value={formData.pet_id}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg focus:outline-none transition-all focus:ring-2"
                    style={{
                      border: "2px solid #DFA55D40",
                      backgroundColor: "#f9f6f2",
                      color: "#4B5563",
                      focusRing: "#DFA55D",
                    }}
                  >
                    <option value="">-- Choose a pet --</option>
                    {pets.length > 0 ? (
                      pets.map((pet) => (
                        <option key={pet._id} value={pet._id}>
                          {pet.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No pets available</option>
                    )}
                  </select>
                </div>
                {/* Pet Profiles Preview */}
                <div className="space-y-3">
                  {pets.map((pet) => (
                    <div
                      key={pet._id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        formData.pet_id === pet._id
                          ? "border-2 shadow-md"
                          : "border"
                      }`}
                      style={{
                        borderColor:
                          formData.pet_id === pet._id ? "#BC4626" : "#DFA55D20",
                        backgroundColor:
                          formData.pet_id === pet._id ? "#f9f6f2" : "white",
                      }}
                    >
                      <div
                        className="relative w-12 h-12 rounded-full overflow-hidden border-2"
                        style={{ borderColor: "#DFA55D" }}
                      >
                        <img
                          src={
                            pet.pet_image && pet.pet_image.length > 0
                              ? pet.pet_image[0]
                              : "/default-pet.png"
                          }
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                        {formData.pet_id === pet._id && (
                          <div
                            className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: "#BC4626" }}
                          >
                            ✓
                          </div>
                        )}
                      </div>
                      <div>
                        <p
                          className="font-semibold"
                          style={{
                            color:
                              formData.pet_id === pet._id
                                ? "#BC4626"
                                : "#4B5563",
                          }}
                        >
                          {pet.name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {pet.breed}, {pet.age} years
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Appointment Date & Time */}
                <div className="mt-8">
                  <h3
                    className="text-lg font-semibold mb-3"
                    style={{ color: "#347486" }}
                  >
                    <span className="mr-2">📅</span>Choose Date & Time
                  </h3>
                  <div
                    style={{
                      border: "2px solid #DFA55D40",
                      backgroundColor: "#f9f6f2",
                      borderRadius: "12px",
                      padding: "16px",
                    }}
                  >
                    <DatePicker
                      selected={
                        formData.appointment_date
                          ? new Date(formData.appointment_date)
                          : null
                      }
                      onChange={(date) =>
                        setFormData((prev) => ({
                          ...prev,
                          appointment_date: date.toISOString(),
                        }))
                      }
                      minDate={new Date()}
                      showTimeSelect
                      inline
                      timeFormat="HH:mm"
                      timeIntervals={30}
                      dateFormat="MMMM d, yyyy h:mm aa"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Middle Column - Package Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
                <h2
                  className="text-xl font-bold mb-5"
                  style={{ color: "#BC4626" }}
                >
                  Choose Package
                </h2>

                {services.length > 0 && services[0]?.packages ? (
                  <div className="space-y-4">
                    {Object.entries(services[0].packages).map(([key, pkg]) => (
                      <div
                        key={key}
                        onClick={() =>
                          setFormData({ ...formData, package_type: pkg.type })
                        }
                        className={`cursor-pointer rounded-xl p-5 transition-all hover:shadow-md relative`}
                        style={{
                          backgroundColor:
                            formData.package_type === pkg.type
                              ? "#DFA55D15"
                              : "#f9f6f2",
                          borderWidth: "2px",
                          borderStyle: "solid",
                          borderColor:
                            formData.package_type === pkg.type
                              ? "#BC4626"
                              : "#e5e5e5",
                        }}
                      >
                        {formData.package_type === pkg.type && (
                          <div
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                            style={{ backgroundColor: "#BC4626" }}
                          >
                            ✓
                          </div>
                        )}
                        <div className="mb-2">
                          <h4
                            className="font-bold text-lg"
                            style={{ color: "#BC4626" }}
                          >
                            {pkg.type.charAt(0).toUpperCase() +
                              pkg.type.slice(1)}{" "}
                            Package
                          </h4>
                        </div>
                        <p className="text-gray-500 text-sm mb-3">
                          Price: ${pkg.price} | Duration: {pkg.duration} min
                        </p>
                        <div className="space-y-1">
                          {pkg.includes.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center text-sm"
                            >
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center mr-2"
                                style={{ backgroundColor: "#34748620" }}
                              >
                                <span style={{ color: "#347486" }}>✓</span>
                              </div>
                              <span className="text-gray-600">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No packages available for this service.</p>
                )}
              </div>
            </div>

            {/* Right Column - Notes & Booking */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
                <h2
                  className="text-xl font-bold mb-5"
                  style={{ color: "#BC4626" }}
                >
                  Appointment Details
                </h2>
                {/* Special Notes */}
                <div className="mb-6">
                  <h3
                    className="text-base font-semibold mb-3"
                    style={{ color: "#347486" }}
                  >
                    <span className="mr-2">📝</span>Special Notes
                  </h3>
                  <textarea
                    name="special_notes"
                    value={formData.special_notes}
                    onChange={handleChange}
                    placeholder="Add any special instructions, allergies, or preferences here..."
                    className="w-full p-4 h-36 rounded-lg focus:outline-none resize-none focus:ring-2"
                    style={{
                      border: "2px solid #DFA55D40",
                      backgroundColor: "#f9f6f2",
                      color: "#4B5563",
                      focusRing: "#DFA55D",
                    }}
                  />
                </div>
                {/* Appointment Summary */}
                <div
                  className="mb-6 rounded-lg p-4"
                  style={{ backgroundColor: "#f9f6f2" }}
                >
                  <h3
                    className="font-semibold mb-3"
                    style={{ color: "#347486" }}
                  >
                    Appointment Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service:</span>
                      <span className="font-medium">
                        {services[0]?.service_name || "Pet Care"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Package:</span>
                      <span className="font-medium capitalize">
                        {packageDetails[formData.package_type].name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pet:</span>
                      <span className="font-medium">
                        {formData.pet_id
                          ? pets.find((p) => p._id === formData.pet_id)?.name ||
                            "Selected"
                          : "Not selected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date & Time:</span>
                      <span className="font-medium">
                        {formData.appointment_date
                          ? new Date(formData.appointment_date).toLocaleString()
                          : "Not selected"}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Use Loyalty Points */}
                <div
                  className="flex items-center gap-3 p-4 rounded-lg mb-8"
                  style={{ backgroundColor: "#34748615" }}
                >
                  <input
                    type="checkbox"
                    name="usePoints"
                    checked={formData.usePoints}
                    onChange={handleChange}
                    className="w-5 h-5 rounded"
                    style={{ accentColor: "#BC4626" }}
                  />
                  <div>
                    <span className="font-medium" style={{ color: "#347486" }}>
                      Use Loyalty Points
                    </span>
                    <p className="text-xs text-gray-500">
                      Apply your available points to get a discount
                    </p>
                  </div>
                </div>
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full py-4 rounded-lg font-bold text-white shadow-md transition duration-200 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: submitLoading ? "#DFA55D" : "#BC4626",
                    boxShadow: "0 4px 14px rgba(188, 70, 38, 0.25)",
                  }}
                >
                  {submitLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Booking...</span>
                    </>
                  ) : (
                    <>
                      <span>Book Appointment</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentCreate;
