import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoChevronBack } from "react-icons/io5";
import { aboutUsBanner } from "../../assets";
import { safetyRules } from "../../data/placeAdData";
import { loadDraft, selectDraftData } from "../../features/listings/draftSlice";

const SafetyPlanPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux selectors
  const draftData = useSelector(selectDraftData);

  // Load draft data on component mount
  useEffect(() => {
    dispatch(loadDraft());
  }, [dispatch]);

  const handleAgree = () => {
    // Check if draft data exists
    if (draftData) {
      navigate("/place-ad/select-plan");
    } else {
      // If no draft, redirect to form creation
      navigate("/place-ad");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="flex items-center p-4  bg-white">
        <button onClick={() => navigate(-1)} className="p-2">
          <IoChevronBack className="text-2xl text-[var(--color-dark)]" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 section-container">
        {/* Title Section */}
        <div className="bg-[#FDF7F7] rounded-xl p-6 mb-6 section-container">
          <h2 className="text-xl font-semibold text-[var(--color-dark)] mb-2">
            Safety first
          </h2>
          <p className="text-[var(--color-dark)]">
            We review all ads to keep everyone on Rixdu safe and happy
          </p>
          <img
            src={aboutUsBanner}
            alt="Safety Illustration"
            className="w-full h-auto max-h-[300px] object-contain mt-4"
          />
        </div>

        {/* Rules Section */}
        <div className="mb-6">
          <h3 className="text-[var(--color-dark)] mb-4">
            Your ad will not go live if it is:
          </h3>
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[7px] top-[-10px] bottom-[-10px] w-[2px] bg-[var(--color-primary)]"></div>

            {/* Rules */}
            <div className="space-y-6">
              {safetyRules.map((rule, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-[var(--color-primary)] mt-1"></div>
                  </div>
                  <p className="text-[var(--color-dark)] flex-1">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Terms Link */}
        <div className="text-center mb-6">
          <p className="text-[var(--color-dark)]">
            For more information,read our{" "}
            <Link to="/terms" className="text-[var(--color-primary)]">
              Term and Conditions
            </Link>
          </p>
        </div>

        {/* Agree Button */}
        <button
          onClick={handleAgree}
          className="w-full bg-[var(--color-primary)] text-[var(--color-white)] px-4 py-3 rounded-lg hover:bg-[var(--color-secondary)] transition-colors font-medium"
        >
          Yes, I agree
        </button>
      </div>
    </div>
  );
};

export default SafetyPlanPage;
