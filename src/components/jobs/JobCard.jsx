import React from "react";
import { useNavigate } from "react-router-dom";
import * as assets from "../../assets";
import hiring from "../../assets/icons/8062071.png";

const JobCard = ({
  job,
  detailUrlPrefix = "/jobs/detail/",
  isJobSeeker = false,
}) => {
  const navigate = useNavigate();

  return (
    <div
      key={job.id}
      className="bg-[#EDF4FF] p-4 lg:p-6 rounded-2xl border border-blue-100 hover:shadow-md transition-all cursor-pointer"
      onClick={() => navigate(`${detailUrlPrefix}${job.slug || job.id}`)}
    >
      {isJobSeeker ? (
        // Job Seeker View - Simple layout with title, experience, location, and salary
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg lg:text-xl text-gray-900 mb-1">
              {job.title}
            </h3>
            <p className="text-gray-700 text-sm lg:text-base">{job.bio}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
            <div className="flex items-center gap-3">
              <img src={assets.moneyIcon} alt="salary" className="w-5 h-5" />
              <span className="text-gray-700 text-sm">{job.salary}</span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={assets.clockIcon}
                alt="experience"
                className="w-5 h-5"
              />
              <span className="text-gray-700 text-sm">{job.experience}</span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={assets.locationIcon}
                alt="location"
                className="w-5 h-5"
              />
              <span className="text-gray-700 text-sm">{job.location}</span>
            </div>

            {job.type && (
              <div className="flex items-center gap-3">
                <img src={hiring} alt="type" className="w-5 h-5" />
                <span className="text-gray-700 text-sm">{job.type}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Job Poster View - Original layout with company logo and full details
        <>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4 sm:gap-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                <img src={job?.img} alt="company" />
              </div>
              <div>
                <h3 className="font-bold text-lg lg:text-xl text-gray-900 mb-1">
                  {job.title}
                </h3>
                <p className="text-gray-700 text-sm lg:text-base">
                  {job.company}
                </p>
              </div>
            </div>

            <span className="text-blue-500 text-sm font-medium self-start sm:self-auto">
              {job.postedTime}
            </span>
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-y-3 gap-x-6 ml-0 sm:ml-16 lg:ml-18">
            <div className="flex items-center gap-3">
              <img src={assets.moneyIcon} alt="money" className="w-5 h-5" />
              <span className="text-gray-700 text-sm">{job.salary}</span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={assets.clockIcon}
                alt="experience"
                className="w-5 h-5"
              />
              <span className="text-gray-700 text-sm">{job.experience}</span>
            </div>

            <div className="flex items-center gap-3">
              <img src={assets.clockIcon} alt="time" className="w-5 h-5" />
              <span className="text-gray-700 text-sm">{job.type}</span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={assets.locationIcon}
                alt="location"
                className="w-5 h-5"
              />
              <span className="text-gray-700 text-sm">{job.location}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default JobCard;
