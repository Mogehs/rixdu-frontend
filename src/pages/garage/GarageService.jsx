import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import VehicleCarousel from "../../components/VehicleCarousel";
import { FaDroplet } from "react-icons/fa6";
import { HiOutlineChip } from "react-icons/hi";
import { MdCarRepair } from "react-icons/md";
import { TbAirConditioning } from "react-icons/tb";
import {
  MdOutlineTireRepair,
  MdOutlineBatteryChargingFull,
} from "react-icons/md";

import { garageHero, garageCta, healthHeroBgScreen } from "../../assets";
import { useNavigate } from "react-router-dom";
import { getVehicleListings } from "../../features/listings/listingsSlice";

const services = [
  {
    icon: <FaDroplet className="text-[#007BFF] text-3xl" />,
    title: "Oil Change",
    desc: "Quick and reliable oil replacement for engine health.",
  },
  {
    icon: <HiOutlineChip className="text-[#007BFF] text-3xl" />,
    title: "Engine Diagnostics",
    desc: "Full engine check-up with smart diagnostics tools.",
  },
  {
    icon: <MdCarRepair className="text-[#007BFF] text-3xl" />,
    title: "Brake Repair",
    desc: "Expert brake inspection and repair for safe driving.",
  },
  {
    icon: <TbAirConditioning className="text-[#007BFF] text-3xl" />,
    title: "AC Service",
    desc: "Fast and efficient air conditioning check and refill.",
  },
  {
    icon: <MdOutlineTireRepair className="text-[#007BFF] text-3xl" />,
    title: "Tire Replacement",
    desc: "High-quality tire fitting and alignment.",
  },
  {
    icon: <MdOutlineBatteryChargingFull className="text-[#007BFF] text-3xl" />,
    title: "Battery Service",
    desc: "Battery checkup and replacement with warranty.",
  },
];

const GarageService = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { vehicleListings, loadingVehicles } = useSelector(
    (state) => state.listings
  );

  useEffect(() => {
    // Fetch vehicle listings with limit of 20
    dispatch(
      getVehicleListings({
        limit: 20,
        sort: "createdAt",
        order: "desc",
      })
    );
  }, [dispatch]);

  return (
    <div className="bg-white">
      {/* Hero Section - matches HealthLanding */}
      <section
        className="relative overflow-hidden bg-no-repeat bg-cover"
        style={{
          backgroundImage: `
      url(${healthHeroBgScreen}),
      linear-gradient(to bottom, rgba(241, 250, 255, 0.8) 0%, rgba(232, 241, 255, 0.6) 47%)
    `,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="section-container relative z-10 grid grid-cols-1 md:grid-cols-2 gap-48 md:gap-16 items-center">
          {/* Text Content */}
          <div className="md:pl-8 py-16 max-w-[500px]">
            <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-headings">
              Your Complete Automotive Service Platform
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray mb-8 max-w-xl">
              Find the best automotive services for your vehicle or become a
              trusted service provider. Connect with quality professionals or
              offer your expertise to thousands of vehicle owners.
            </p>
            <div className="flex flex-col lg:flex-row gap-4 md:justify-start">
              <button
                className="bg-primary text-white px-8 py-3 rounded-full text-base sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-150 hover:bg-secondary active:scale-95 shadow-none"
                onClick={() => navigate("/garage/all-services")}
              >
                Find Services
              </button>
              <button
                className="bg-white border-2 border-primary text-primary px-8 py-3 rounded-full text-base sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-150 hover:bg-primary hover:text-white active:scale-95 shadow-none"
                onClick={() => navigate("/place-ad")}
              >
                Become Provider
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="flex justify-center md:justify-end relative md:w-full md:h-full">
            <img
              src={garageHero}
              alt="Garage Professionals"
              className="w-[350px] sm:w-[400px] md:w-[600px] lg:w-[800px] h-auto absolute bottom-[-20px]"
            />
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-20 bg-white">
        <h3 className="text-4xl font-bold mb-4 text-center text-[#1F2937]">
          Popular Automotive Services
        </h3>
        <p className="text-[#6B7280] mb-10 max-w-2xl mx-auto text-center text-lg">
          From routine maintenance to emergency repairs, find trusted service
          providers for all your vehicle needs.
        </p>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-[0_4px_24px_0_rgba(36,107,253,0.06)] border border-[#F0F4F8] p-8 flex flex-col items-start min-h-[180px] transition hover:shadow-lg"
            >
              <div className="w-16 h-16 mb-4 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                {service.icon}
              </div>

              <h4 className="text-lg font-bold mb-1 text-[#1F2937]">
                {service.title}
              </h4>
              <p className="text-[#4B5563] text-sm">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Split CTA Section - Figma style */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-2">
          <div className="flex flex-col md:flex-row bg-white rounded-[8px] overflow-hidden shadow-sm">
            {/* Image */}
            <div className="md:w-1/2 w-full h-[320px] md:h-auto flex items-stretch">
              <img
                src={garageCta}
                alt="Mechanic"
                className="w-full h-full object-cover"
                style={{ minHeight: 240 }}
              />
            </div>
            {/* Content */}
            <div className="md:w-1/2 w-full flex flex-col justify-center px-6 py-8 md:py-0 md:pl-10">
              <span className="inline-block bg-[#E6F4FF] text-[#42A5F5] px-4 py-1 rounded-full text-xs font-medium mb-4 w-fit">
                500+ service providers already earning through Rixdu
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-[#484848] mb-3 text-left">
                Become a Trusted Service Provider
              </h3>
              <p className="text-[#4B5563] b-7 text-left max-w-md">
                Offer your automotive expertise, reach thousands of customers,
                and grow your business through our trusted platform.
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  className="bg-[#2196F3] text-white px-5 py-2.5 rounded-md font-semibold text-sm hover:bg-[#42A5F5] transition-all border border-[#2196F3]"
                  onClick={() => navigate("/place-ad")}
                >
                  Join as Provider
                </button>
                <button
                  className="bg-white border border-[#2196F3] text-[#42A5F5] px-5 py-2.5 rounded-md font-semibold text-sm hover:bg-[#E6F4FF] transition-all"
                  onClick={() => navigate("/garage/all-services")}
                >
                  Browse Services
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-0">
          <h3 className="text-3xl font-bold mb-6">
            Featured Service Providers
          </h3>
          <p className="text-gray-600 mb-10 max-w-2xl">
            Discover quality automotive services from verified professionals in
            your area
          </p>
          <VehicleCarousel
            vehicles={vehicleListings || []}
            loading={loadingVehicles}
          />
        </div>
      </section>
    </div>
  );
};

export default GarageService;
