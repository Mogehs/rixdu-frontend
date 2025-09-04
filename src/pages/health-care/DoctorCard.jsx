import { locationIcon } from "../../assets";
import {
  MdOutlineVerifiedUser,
  MdStar,
  MdWorkspacePremium,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

const DoctorCard = ({ doctor, noShadow = false }) => {
  const navigate = useNavigate();
  const handleViewProfile = () => {
    if (doctor.slug) {
      navigate(`/health-care/doctor/${doctor.slug}`);
    } else if (doctor.id) {
      navigate(`/health-care/doctor/${doctor.id}`);
    } else {
      navigate("/health-care/doctor/1");
    }
  };

  // Helper function to determine badge priority and display
  const getBadgeInfo = () => {
    const badges = [];

    // Featured badge (highest priority)
    if (doctor.isFeatured) {
      badges.push({
        text: "Featured",
        icon: <MdStar className="text-sm" />,
        bgColor: "bg-slate-800",
        textColor: "text-white",
        priority: 1,
      });
    }

    // Premium badge
    if (doctor.isPremium && !doctor.isFeatured) {
      badges.push({
        text: "Premium",
        icon: <MdWorkspacePremium className="text-sm" />,
        bgColor: "bg-slate-700",
        textColor: "text-white",
        priority: 2,
      });
    }

    // Verified badge (lowest priority, always show if verified)
    if (doctor.isVerified) {
      badges.push({
        text: "Verified",
        icon: <MdOutlineVerifiedUser className="text-sm" />,
        bgColor: "bg-[#DCFCE7]",
        textColor: "text-[#166534]",
        priority: 3,
      });
    }

    return badges.sort((a, b) => a.priority - b.priority);
  };

  const badges = getBadgeInfo();

  // Helper function to truncate location text
  const truncateLocation = (location, maxLength = 25) => {
    if (!location) return "Location not specified";
    if (location.length <= maxLength) return location;
    return location.substring(0, maxLength) + "...";
  };

  // Helper function to truncate name text
  const truncateName = (name, maxLength = 18) => {
    if (!name) return "Healthcare Professional";
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  return (
    <div
      className={`bg-white rounded-[20px] overflow-hidden w-full max-w-[320px] mx-auto flex flex-col ${
        noShadow ? "" : "shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
      }`}
      style={{ minWidth: 250 }}
    >
      <div className="relative w-full h-[200px] flex items-center justify-center">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-full h-full object-cover"
          style={{
            zIndex: 2,
          }}
        />
        {/* Display badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
          {badges.slice(0, 2).map((badge, index) => (
            <span
              key={index}
              className={`flex items-center gap-1 ${badge.bgColor} ${
                badge.textColor
              } px-2 py-1 rounded text-xs font-medium ${
                noShadow ? "" : "shadow-sm"
              }`}
            >
              {badge.icon}
              {badge.text}
            </span>
          ))}
        </div>
      </div>
      <div className="px-6 pt-8 pb-6 flex flex-col gap-1">
        <div className="flex items-center justify-between mb-1">
          <h4
            className="font-bold text-[1.25rem] text-[#1A253C] flex-1 min-w-0 mr-2"
            title={doctor.name}
          >
            <span className="block truncate">{truncateName(doctor.name)}</span>
          </h4>
          <span className="bg-[#EAF6FF] text-[#19B5FE] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">
            {doctor.specialty}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-[#5A6A85] mb-1">
          <img
            src={locationIcon}
            alt="Location"
            className="w-4 h-4 opacity-75"
          />
          <span title={doctor.location}>
            {truncateLocation(doctor.location)}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#5A6A85] text-xs">
            {doctor.experience} years of experience
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[#1A253C] font-semibold text-sm">
            {doctor.fee}
          </span>
          <button
            className="bg-[#19B5FE] text-white font-semibold text-base px-6 py-2 rounded-lg shadow hover:bg-[#1396d1] transition-colors"
            onClick={handleViewProfile}
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
