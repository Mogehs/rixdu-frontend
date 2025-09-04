import React, { useState } from "react";
import { toast } from "react-toastify";

const consultationTypes = [
  { label: "In-Clinic Visit", value: "clinic" },
  { label: "Online Consultation", value: "online" },
  { label: "Home Visit", value: "home" },
];

const BookingModal = ({
  open,
  onClose,
  doctorName,
  doctorSpecialty,
  selectedDate,
  selectedTime,
  onSubmit,
}) => {
  const [consultationType, setConsultationType] = useState("clinic");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!selectedDate) {
      toast.error("Please select a date for your appointment.");
      return;
    }

    if (!selectedTime) {
      toast.error("Please select a time slot for your appointment.");
      return;
    }

    if (!patientName.trim()) {
      toast.error("Please enter patient name.");
      return;
    }

    if (!phone.trim()) {
      toast.error("Please enter phone number.");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter email address.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[+]?[0-9\-()s]+$/;
    if (!phoneRegex.test(phone.trim()) || phone.trim().length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    if (onSubmit) {
      onSubmit({
        selectedDate,
        selectedTime,
        consultationType,
        patientName: patientName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim(),
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 pt-32 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg px-8 mx-4 md:mx-8 py-8 relative max-h-[75vh] overflow-y-auto custom-scroll">
        <button
          className="absolute top-4 right-6 text-gray-400 hover:text-gray-600 text-3xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Confirm Appointment
          </h2>
          <p className="text-gray-600">
            with{" "}
            <span className="font-semibold text-blue-600">{doctorName}</span>
          </p>
          <p className="text-sm text-gray-500">{doctorSpecialty}</p>
        </div>

        {/* Selected Date & Time Display */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-100">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="text-sm text-blue-600 font-medium mb-1">Date</div>
              <div className="text-lg font-semibold text-blue-800">
                {formatDate(selectedDate)}
              </div>
            </div>
            <div className="w-px h-12 bg-blue-200"></div>
            <div className="text-center">
              <div className="text-sm text-blue-600 font-medium mb-1">Time</div>
              <div className="text-lg font-semibold text-blue-800">
                {selectedTime}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Consultation Type */}
          <div>
            <label className="block font-semibold mb-3 text-gray-700">
              Consultation Type
            </label>
            <div className="grid grid-cols-1 gap-3">
              {consultationTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    consultationType === type.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="consultationType"
                    value={type.value}
                    checked={consultationType === type.value}
                    onChange={() => setConsultationType(type.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      consultationType === type.value
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {consultationType === type.value && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                  <span className="font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Patient Information */}
          <div>
            <label className="block font-semibold mb-3 text-gray-700">
              Patient Information
            </label>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Patient Full Name *"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <textarea
                placeholder="Additional notes or symptoms (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Confirm Appointment
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              You will receive a confirmation email and SMS
            </p>
          </div>
        </form>
      </div>

      {/* Scrollbar Hide CSS */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          display: none;
        }
        .custom-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default BookingModal;
