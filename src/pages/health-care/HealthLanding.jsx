import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ServiceCard from "./ServiceCard";
import CarouselSpecialists from "./CarouselSpecialists";
import {
  getHealthcareListings,
  selectHealthcareListings,
  selectHealthcareListingsLoading,
} from "../../features/listings/listingsSlice";
import {
  CosmeticDentisIcon,
  DentalImplantsIcon,
  EmergencyDentistary,
  PreventionIcon,
  RootCanalIcon,
  TeethWhiteningIcon,
  healthHeroBgScreen,
} from "../../assets";

import {
  doctorcardImage,
  healthHeroImage,
  whyChooseUsDoctorImage,
} from "../../assets";

import { useNavigate } from "react-router-dom";

const HealthLanding = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const healthcareListings = useSelector(selectHealthcareListings);
  const loadingHealthcare = useSelector(selectHealthcareListingsLoading);

  useEffect(() => {
    // Fetch healthcare listings when component mounts
    dispatch(getHealthcareListings({ limit: 8 }));
  }, [dispatch]);

  // Helper function to get image from listing values
  const getListingImage = (listing) => {
    try {
      const values = listing.values;
      if (!values) return doctorcardImage;

      // Try to get image from various possible field names
      const imageFields = [
        "image",
        "images",
        "photo",
        "photos",
        "avatar",
        "picture",
        "profile",
      ];

      for (const field of imageFields) {
        const fieldValue = values.get ? values.get(field) : values[field];
        if (fieldValue) {
          if (typeof fieldValue === "string") return fieldValue;
          if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            return typeof fieldValue[0] === "string"
              ? fieldValue[0]
              : fieldValue[0]?.url || fieldValue[0]?.secure_url;
          }
          if (fieldValue.url) return fieldValue.url;
          if (fieldValue.secure_url) return fieldValue.secure_url;
        }
      }

      return doctorcardImage; // fallback
    } catch {
      return doctorcardImage; // fallback
    }
  };

  // Helper function to get value from listing
  const getListingValue = (listing, fieldName, fallback = "") => {
    try {
      const values = listing.values;
      if (!values) return fallback;

      const value = values.get ? values.get(fieldName) : values[fieldName];
      return value || fallback;
    } catch {
      return fallback;
    }
  };

  // Transform healthcare listings to doctor card format
  const transformedDoctors = healthcareListings.map((listing) => ({
    id: listing._id,
    name:
      getListingValue(listing, "doctorName") ||
      getListingValue(listing, "name") ||
      getListingValue(listing, "title") ||
      "Healthcare Professional",
    image: getListingImage(listing),
    specialty:
      getListingValue(listing, "specialty") ||
      getListingValue(listing, "specialist type") ||
      listing.categoryId?.name ||
      "Healthcare",
    location: listing?.values?.location?.address || listing?.city,
    experience: getListingValue(listing, "experience", "0"),
    fee:
      getListingValue(listing, "fee") ||
      getListingValue(listing, "minFee") ||
      "100",
    slug: listing.slug,
    // Badge information from listing model
    isVerified: listing.isVerified || false,
    isFeatured: listing.isFeatured || false,
    isPremium: listing.isPremium || false,
    plan: listing.plan || "free",
    paymentStatus: listing.paymentStatus || "pending",
  }));

  const services = [
    {
      icon: RootCanalIcon,
      title: "Root Canal Treatment",
      description:
        "Root canal treatment (endodontics) is a dental procedure used to treat infection at the centre of a tooth.",
    },
    {
      icon: CosmeticDentisIcon,
      title: "Cosmetic Dentist",
      description:
        "Cosmetic dentistry is the branch of dentistry that focuses on improving the appearance of your smile.",
    },
    {
      icon: DentalImplantsIcon,
      title: "Dental Implants",
      description:
        "A dental implant is an artificial tooth root that’s placed into your jaw to hold a prosthetic tooth or bridge.",
    },
    {
      icon: TeethWhiteningIcon,
      title: "Teeth Whitening",
      description:
        "It's never been easier to brighten your smile at home. There are all kinds of products you can try.",
    },
    {
      icon: EmergencyDentistary,
      title: "Emergency Dentistry",
      description:
        "In general, any dental problem that needs immediate treatment to stop bleeding, alleviate severe pain.",
    },
    {
      icon: PreventionIcon,
      title: "Preventive",
      description:
        "Preventive dentistry is dental care that helps maintain good oral health. a combination of regular dental.",
    },
  ];

  const features = [
    {
      title: "Verified Professionals",
      desc: "Access a network of verified health and care providers with detailed profiles and reviews.",
      img: whyChooseUsDoctorImage,
    },
    {
      title: "Wide Range of Services",
      desc: "From medical consultations to therapy and care, we cover it all.",
      img: whyChooseUsDoctorImage,
    },
    {
      title: "Secure Communication",
      desc: "Chat safely with professionals through our platform.",
      img: whyChooseUsDoctorImage,
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-800">
      {/* hero section */}
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
        <div className="section-container relative z-10 mx-auto px-4 sm:px-6 lg:px-8  grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="md:pl-8 py-16 sm:py-20 md:py-24 lg:py-28">
            <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-headings">
              Find Health & Care Professionals
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray mb-8 max-w-xl">
              Connect with experienced healthcare providers, therapists, and
              caregivers in your area. Browse listings or post your needs to
              find the right match for your health and wellness journey.
            </p>
            <button
              className="bg-primary text-white px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold shadow hover:bg-secondary transition"
              onClick={() => navigate("/health-care/services")}
            >
              Explore Services
            </button>
          </div>

          {/* Image */}
          <div className="flex justify-center md:justify-end relative h-[250px] md:w-full md:h-full">
            <img
              src={healthHeroImage}
              alt="Health Professionals"
              className="w-[280px] sm:w-[350px] md:w-[400px] lg:w-[480px] h-auto absolute bottom-[-20px]"
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="section-container mx-auto">
          <SectionTitle title="Our Services" />
          <div className="flex gap-4 flex-wrap">
            {services.map((s, idx) => (
              <ServiceCard key={idx} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Specialists Carousel */}
      <section className="py-16 bg-[#E6F6FE]">
        <div className="section-container mx-auto px-4">
          <SectionTitle
            title="Meet Our Specialists"
            subtitle="We use only the best quality materials on the market in order to provide the best products to our patients."
          />
          {loadingHealthcare ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#19B5FE]"></div>
            </div>
          ) : transformedDoctors.length > 0 ? (
            <CarouselSpecialists doctors={transformedDoctors} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No healthcare professionals available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-16 bg-white">
        <div className="section-container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-[#111518]">
              Why Choose Rixdu for Health & Care?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Rixdu connects you with qualified health and care professionals,
              offering a secure and reliable platform to find the support you
              need.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* First Card - Image first, then text */}
            <div className="flex flex-col items-center rounded-xl p-8 min-h-[300px]">
              <div className="w-full h-full mb-6">
                <img
                  src={features[0].img}
                  alt={features[0].title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center text-[#111518]">
                {features[0].title}
              </h3>
              <p className="text-gray-600 text-center">{features[0].desc}</p>
            </div>

            {/* Second Card - Text first, then image */}
            <div className="flex flex-col items-center rounded-xl p-8 min-h-[300px]">
              <h3 className="text-xl font-bold mb-2 text-center text-[#111518]">
                {features[1].title}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {features[1].desc}
              </p>
              <div className="w-full h-full">
                <img
                  src={features[1].img}
                  alt={features[1].title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Third Card - Same as first (image first, then text) */}
            <div className="flex flex-col items-center rounded-xl p-8 min-h-[300px]">
              <div className="w-full h-full mb-6">
                <img
                  src={features[2].img}
                  alt={features[2].title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center text-[#111518]">
                {features[2].title}
              </h3>
              <p className="text-gray-600 text-center">{features[2].desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-[#F7FAFC]">
        <div className="section-container mx-auto px-4 flex flex-col md:flex-row items-end gap-12">
          {/* Left Column: Text */}
          <div className="md:w-1/2">
            <h4 className="text-[#004990] font-semibold mb-2 text-lg">
              WHY CHOOSE US
            </h4>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-[#000D44]">
              We Remain Continuously Available For Your Health Services
            </h2>
            <div className="space-y-8">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-[#004990] flex items-center justify-center text-xl font-bold text-[#004990]">
                  01
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 text-[#000D44]">
                    Compassionate & Expert Care
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Our team of dedicated healthcare professionals combines
                    years of experience with a genuine commitment to providing.
                  </p>
                </div>
              </div>
              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-[#004990] flex items-center justify-center text-xl font-bold text-[#004990]">
                  02
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 text-[#000D44]">
                    Patient-Centered Approach
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Your health and well-being are our top priorities. We take
                    the time to listen to your concerns, answer your questions.
                  </p>
                </div>
              </div>
              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-[#004990] flex items-center justify-center text-xl font-bold text-[#004990]">
                  03
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 text-[#000D44]">
                    Personalized Treatment Plans
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We understand that every patient is unique, and their
                    healthcare needs may vary. That's why we create
                    individualized treatment.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Right Column: Image & Icon */}
          <div className="md:w-1/2 flex justify-center relative">
            <div className="relative">
              <img
                src={whyChooseUsDoctorImage}
                alt="Doctor"
                className="w-[320px] md:w-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const SectionTitle = ({ title, subtitle }) => (
  <div className="text-center mb-10 pb-12">
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#011632] text-capitalize">
      {title}
    </h2>
    {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
  </div>
);

export default HealthLanding;
