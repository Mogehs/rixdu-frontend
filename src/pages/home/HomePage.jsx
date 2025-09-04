import React from "react";
import EnhancedHeroSection from "./EnhancedHeroSection";
import EnhancedEmirates from "./EnhancedEmirates";
import PopularCategories from "./PopularCategories";
import FeaturedListings from "./FeaturedListings";
import PremiumListings from "./PremiumListings";
import CTASection from "./CTASection";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import AppPromo from "./AppPromo";
import PopularResidential from "./PopularResidential";
import CategoriesCards from "./CategoriesCards";
import { useDispatch, useSelector } from "react-redux";
import { fetchHomeData } from "../../features/homeData/homeDataSlice";
import { useEffect } from "react";
import { fetchStores } from "../../features/admin/storesSlice";

const HomePage = () => {
  const dispatch = useDispatch();
  const { stores } = useSelector((state) => state.adminStores);
  useEffect(() => {
    const fetchStoresArray = async () => {
      await dispatch(fetchStores({ level: 0, root: true }));
    };
    fetchStoresArray();
    return () => {};
  }, [dispatch]);

  return (
    <div className="relative">
      {/* Enhanced Hero Section with carousel and trust badges */}
      <EnhancedHeroSection />

      {/* Enhanced Cities Section with landmark images and staggered grid */}
      <EnhancedEmirates />

      {/* Popular Categories with enhanced animations */}
      <PopularCategories categories={stores} />

      {/* Featured Listings Carousel */}
      <FeaturedListings
        title="Featured Listings"
        showCityFilter={true}
        backgroundColor="bg-gray-50"
        autoPlay={true}
        autoPlayInterval={5000}
        buttonText="View All Listings in"
        linkPath="/all-listings"
      />

      {/* Premium Listings Carousel */}
      <PremiumListings />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Full-width CTA Section with parallax scrolling */}
      {/* <CTASection /> */}

      {/* Popular Residential - keeping original */}
      <PopularResidential />

      {/* Testimonials and Success Stories */}
      {/* <Testimonials /> */}

      {/* Categories Cards with enhanced hover effects */}
      {/* <CategoriesCards /> */}

      {/* App Promotion Section */}
      <AppPromo />
    </div>
  );
};

export default HomePage;
