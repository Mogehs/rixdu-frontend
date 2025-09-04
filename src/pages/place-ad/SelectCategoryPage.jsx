import React from "react";
import { useNavigate, useParams } from "react-router-dom";
// import { placeAdCategories } from "../../data/placeAdData";
import { useDispatch, useSelector } from "react-redux";
import { fetchStores } from "../../features/admin/storesSlice";

// Using categories from imported data
// const categories = placeAdCategories;

const SelectCategoryPage = () => {
  const navigate = useNavigate();
  const { city } = useParams();
  const {
    stores: storeList,
    loading,
    // error,
  } = useSelector((state) => state.adminStores);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchStores({ root: 0, level: 0 }));
  }, [dispatch]);

  const handleCategorySelect = (categoryValue) => {
    navigate(`/place-ad/${city}/${categoryValue}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2 text-[var(--color-headings)]">
          What are you listing?
        </h1>
        <p className="text-[var(--color-dark)]">
          Choose the category that your ads fit into
        </p>
      </div>

      {loading ? (
        "Loading categories..."
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {storeList.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategorySelect(category.slug)}
              className="p-6 bg-[var(--color-white)] rounded-lg shadow-elegant border border-[var(--color-border)] flex flex-col items-center justify-center hover:border-[var(--color-primary)] transition-colors text-center"
            >
              <img
                src={category.icon.url}
                alt={category.name}
                className="w-12 h-12 mb-3"
              />
              <span className="text-lg text-[var(--color-dark)]">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectCategoryPage;
