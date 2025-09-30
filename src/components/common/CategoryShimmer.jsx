import React from "react";

const CategoryShimmer = ({ count = 5 }) => {
  return (
    <div className="section-container">
      <div className="h-8 bg-gray-200 rounded-lg w-64 mb-6 animate-pulse"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8 md:gap-10 lg:gap-12 gap-y-12 sm:gap-y-16 md:gap-y-16 lg:gap-y-20 my-6 sm:my-10 md:my-14 lg:my-18 justify-center">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="flex flex-col justify-between gap-3 sm:gap-4 p-4 sm:p-0 rounded-xl bg-white/50 sm:bg-transparent shadow-sm sm:shadow-none border border-gray-100 sm:border-0 animate-pulse"
          >
            <div className="flex flex-col gap-3">
              {/* Store header shimmer */}
              <div className="flex gap-2 items-center">
                <div className="bg-gray-200 p-2 rounded-full sm:bg-gray-200 sm:p-0 w-9 h-9 sm:w-10 sm:h-10"></div>
                <div className="h-5 bg-gray-200 rounded w-24"></div>
              </div>

              {/* Categories shimmer */}
              <div className="flex flex-col gap-2 sm:gap-1 pl-2 sm:pl-0">
                {Array.from({ length: 4 }, (_, categoryIndex) => {
                  // Vary the width of category items for more realistic shimmer
                  const widths = ["w-16", "w-20", "w-24", "w-18"];
                  return (
                    <div
                      key={categoryIndex}
                      className="flex items-center gap-1 before:content-['•'] before:text-gray-200 sm:before:content-none"
                    >
                      <div
                        className={`h-4 bg-gray-200 rounded ${
                          widths[categoryIndex] || "w-20"
                        }`}
                      ></div>
                    </div>
                  );
                })}

                {/* "+X more" shimmer */}
                <div className="flex gap-2 items-center mt-1 sm:mt-0">
                  <div className="h-4 bg-gray-200 rounded-full w-16"></div>
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                </div>

                {/* "All in Store" button shimmer */}
                <div className="flex gap-2 items-center mt-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryShimmer;
