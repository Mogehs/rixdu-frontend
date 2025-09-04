import React, { useEffect } from "react";
import { ListingCarousel } from "../../components/common";
import { useDispatch, useSelector } from "react-redux";
import { fetchStores } from "../../features/admin/storesSlice";

const PremiumListings = () => {
  const dispatch = useDispatch();
  const { stores } = useSelector((state) => state.adminStores);

  useEffect(() => {
    // Fetch stores if not already loaded
    if (stores.length === 0) {
      dispatch(fetchStores());
    }
  }, [dispatch, stores.length]);

  return (
    <ListingCarousel
      title="Discover Top Listings in Your Favorite Category"
      stores={stores}
      backgroundColor="bg-white"
      buttonText="Discover All Projects in"
      linkPath="/category"
      showCityFilter={true}
      autoPlay={true}
      autoPlayInterval={7000}
    />
  );
};

export default PremiumListings;
