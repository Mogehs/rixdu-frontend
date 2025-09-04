import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { healthCareServicesBanner } from "../../assets";

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to services listing page with search term as a query parameter
      navigate(
        `/health-care/services?search=${encodeURIComponent(searchTerm.trim())}`
      );
    } else {
      // If no search term, just navigate to services listing
      navigate("/health-care/services");
    }
  };

  return (
    <section
      className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${healthCareServicesBanner})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex flex-col items-center w-full px-4">
        <h1 className="text-white text-3xl md:text-5xl font-bold text-center mb-4 drop-shadow-lg">
          Health & Care Services
        </h1>
        <p className="text-[#E5E7EB] text-base md:text-base text-center mb-6 max-w-2xl drop-shadow">
          Find trusted health and care professionals in your area. Browse a wide
          range of services from medical consultations to home care.
        </p>
        <form
          onSubmit={handleSearch}
          className="w-full max-w-xl flex items-center bg-white rounded-full shadow-md px-4 py-2"
        >
          <svg
            className="w-5 h-5 text-gray-400 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search for doctors, specialties, or services..."
            className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="ml-2 bg-primary hover:bg-secondary text-white font-semibold px-6 py-2 rounded-full transition-colors"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
