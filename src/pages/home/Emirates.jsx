import React from "react";
import { Link } from "react-router-dom";

const Emirates = () => {
  const cities = [
    { city: "Dubai", link: "/emirate/dubai" },
    { city: "Abu Dhabi", link: "/emirate/abu-dhabi" },
    { city: "Sharjah", link: "/emirate/sharjah" },
    { city: "Ras Al Khaiah", link: "/emirate/ras-al-khaiah" },
    { city: "Ajman", link: "/emirate/ajman" },
    { city: "Fujairah", link: "/emirate/fujairah" },
    { city: "Umm Al Quwain", link: "/emirate/umm-al-quwain" },
  ];

  return (
    <section className="section-container">
      <h1 className="section-heading">Which city awaits your discovery</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 my-0 mx-auto">
        {cities.map((city, index) => {
          return (
            <div
              key={index}
              className="bg-white shadow-elegant rounded-xl px-3 sm:px-4 py-3"
            >
              <div>
                <Link
                  to={city.link}
                  className="text-dark cursor-pointer h-18 flex rounded-xl items-center justify-center text-xs sm:text-sm md:text-base"
                >
                  {city.city}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Emirates;
