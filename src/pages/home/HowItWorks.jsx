import React, { useEffect, useRef, useState } from "react";
import { howItWorksSteps } from "../../data";
import { useNavigation } from "react-router";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="py-20" ref={sectionRef}>
      <div className="mx-auto">
        {/* Header */}

        <div className="bg-[linear-gradient(45deg,_rgba(66,165,245,0.07)_0%,_rgba(66,165,245,0.28)_100%)] p-8 shadow-sm hover:shadow-md transition-all duration-300 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2D3748] mb-4">
              Your Trusted Marketplace
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Discover a secure and reliable platform to connect with buyers and
              sellers.
              <br />
              Ensuring safe transactions and peace of mind.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 section-container  mb-16 ">
            {howItWorksSteps.map((step, index) => {
              return (
                <div
                  key={step.id}
                  className={`bg-[linear-gradient(45deg,_rgba(66,165,245,0.07)_0%,_rgba(66,165,245,0.28)_100%)] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Icon */}
                  <div className="mb-4 flex justify-center">
                    <div className="">
                      {step.icon && (
                        <img
                          src={step.icon}
                          alt={step.title}
                          className="w-16 h-16"
                        />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center space-y-3">
                    <h3 className="text-lg font-semibold text-[#374151]">
                      {step.title}
                    </h3>
                    <p className="text-[#374151] text-sm leading-relaxed">
                      {step.description}
                    </p>

                    {/* Details */}
                    <div className="pt-2 flex justify-center">
                      <ul className="space-y-1">
                        {step.details.map((detail, detailIndex) => (
                          <li
                            key={detailIndex}
                            className="flex items-center gap-2 text-xs text-[#374151]"
                          >
                            <div className="w-1 h-1 bg-[#374151] rounded-full flex-shrink-0"></div>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[linear-gradient(45deg,_#87CEEB_0%,_#42A5F5_100%)] section-container mt-20 relative rounded-3xl p-12 text-center text-white overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-6 left-8 w-8 h-8 border-2 border-white/20 rounded-lg"></div>
          <div className="absolute top-12 left-16 w-4 h-4 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-8 left-12 w-6 h-6 border border-white/20 rounded-full"></div>
          <div className="absolute top-8 right-12 w-12 h-12 border border-white/20 rounded-2xl"></div>
          <div className="absolute bottom-12 right-8 w-8 h-8 bg-white/10 rounded-lg"></div>
          <div className="absolute bottom-6 right-20 w-3 h-3 bg-white/20 rounded-full"></div>
          <div className="absolute top-16 right-6 w-16 h-16 border border-white/10 rounded-3xl"></div>

          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto text-lg">
              Join thousands on Rixdu — Buy, Sell, and Connect in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/place-ad")}
                className="bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200"
              >
                Post Your First Ad
              </button>
              <button
                onClick={() => navigate("/all-listings")}
                className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                Start Browsing
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
