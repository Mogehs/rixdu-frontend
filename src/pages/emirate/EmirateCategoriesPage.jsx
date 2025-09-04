import React, { use, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { categoriesData } from "../../data/data";
import * as assets from "../../assets";
import PopularCategories from "../home/PopularCategories";
import { useDispatch, useSelector } from "react-redux";
import { fetchStores } from "../../features/admin/storesSlice";

const EmirateCategoriesPage = () => {
  const { emirate } = useParams();
  const formattedEmirate = emirate.replace(/-/g, " ");

  const { stores } = useSelector((state) => state.adminStores);
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchStoresArray = async () => {
      await dispatch(fetchStores({ level: 0, root: true }));
    };
    fetchStoresArray();
    return () => {};
  }, [dispatch]);

  return (
    <div className="section-container">
      <h1 className="section-heading mb-2">{formattedEmirate}</h1>
      <p className="text-xl mb-8">
        Please select the category to show your ads
      </p>
      <PopularCategories
        categories={stores}
        isEmirate={true}
        emirate={emirate}
      />

      {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categoriesData.map((category, index) => (
          <Link
            to={category.links?.[0]?.link || "/"}
            key={index}
            className="block"
          >
            <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center h-36">
              <div className="mb-4">
                <img
                  src={category.icon}
                  alt={category.name}
                  className="w-9 h-9"
                />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-dark">
                  {category.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div> */}

      <div
        className="rounded-lg mt-12 p-8 text-white h-[200px] relative overflow-hidden bg-blue-fade"
        style={{
          backgroundImage: `linear-gradient(to right, #42A5F5 33%, rgba(0, 0, 0, 0) 100%), url(${assets.emiratesCategoryCtaBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Rixdu</h2>
          <p className="text-lg">
            Find Your Perfect Place, Best Car, Find a Job, Anytime, Anywhere
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmirateCategoriesPage;
