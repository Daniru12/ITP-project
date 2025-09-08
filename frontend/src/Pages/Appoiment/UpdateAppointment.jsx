import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import HamsterLoader from "../../components/HamsterLoader";

const UpdateAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    appointment_date: "",
    package_type: "",
    special_notes: "",
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/appointments/user/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data;
        setAppointment(data);
        setFormData({
          appointment_date: data.appointment_date?.slice(0, 16), // for datetime-local
          package_type: data.package_type || "",
          special_notes: data.special_notes || "",
        });
      } catch (err) {
        toast.error("Failed to load appointment");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [backendUrl, token, id]);

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      await axios.put(`${backendUrl}/api/appointments/user/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Appointment updated successfully!");
      setTimeout(() => {
        navigate("/Appointment");
      }, 1000);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update appointment"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const getPackageDescription = (type) => {
    switch (type) {
      case "basic":
        return "Essential service with standard offerings";
      case "premium":
        return "Enhanced service with added benefits";
      case "luxury":
        return "Complete premium experience with all features";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-amber-50">
        <HamsterLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e6e2de] bg-opacity-70 py-8 px-4 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#2c3e50] border-opacity-10 md:flex">
          {/* Left Side - Header and Information */}
          <div className="md:w-1/3 bg-[#e67d2284] text-black bg-opacity-70 backdrop-blur-lg">
            <div className="p-6 md:p-8 h-full flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Update Appointment</h2>
                <p className="text-sm opacity-90 mt-2">
                  Modify your scheduled appointment details
                </p>
              </div>

              <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-sm text-black mb-2">
                  Appointment Information
                </h3>
                <p className="text-xs text-black text-opacity-90">
                  Here you can update your appointment details including date,
                  time, package selection, and add special notes or requests.
                </p>
              </div>

              {appointment?.service_id?.service_name && (
                <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-auto">
                  <h3 className="font-medium text-sm text-black mb-2">
                    Selected Service
                  </h3>
                  <p className="text-black text-opacity-90 font-medium">
                    {appointment.service_id.service_name}
                  </p>
                </div>
              )}

              <div className="mt-auto pt-4">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-black text-opacity-80"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-xs text-black text-opacity-80">
                    Your appointment will be immediately updated in our system.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-2/3">
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Appointment Date & Time */}
                <div className="md:col-span-1">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <div className="w-5 h-5 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center mr-2">
                      <span className="text-secondary text-xs">1</span>
                    </div>
                    Appointment Date & Time
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      name="appointment_date"
                      min={getMinDateTime()}
                      value={formData.appointment_date}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Package Type */}
                <div className="md:col-span-1">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <div className="w-5 h-5 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center mr-2">
                      <span className="text-secondary text-xs">2</span>
                    </div>
                    Package
                  </label>
                  <div className="relative">
                    <select
                      name="package_type"
                      value={formData.package_type}
                      onChange={handleChange}
                      required
                      className="w-full appearance-none border border-gray-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                    >
                      <option value="">-- Select Package --</option>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="luxury">Luxury</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Info */}
              {formData.package_type && (
                <div className="mt-4 mb-6 p-4 rounded-lg bg-secondary bg-opacity-10 border-l-4 border">
                  <div className="font-medium text-sm capitalize text-gray-800">
                    {formData.package_type} Package
                  </div>
                  <div className="text-xs mt-1 text-gray-600">
                    {getPackageDescription(formData.package_type)}
                  </div>
                </div>
              )}

              {/* Special Notes */}
              <div className="mb-8 mt-6">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <div className="w-5 h-5 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center mr-2">
                    <span className="text-secondary text-xs">3</span>
                  </div>
                  Special Notes
                </label>
                <textarea
                  name="special_notes"
                  value={formData.special_notes}
                  onChange={handleChange}
                  placeholder="Add any special requests or notes..."
                  className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/Appointment")}
                  className="py-3 px-6 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="bg-[#e67e22] text-white py-3 px-6 rounded-lg font-medium shadow-sm hover:bg-[#d95b1f] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#e67e22] disabled:opacity-50 flex justify-center items-center"
                >
                  {submitLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateAppointment;
