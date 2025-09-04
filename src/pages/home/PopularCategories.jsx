import { Link, useNavigate } from "react-router-dom";
import { HiOutlineArrowLongRight } from "react-icons/hi2";

const PopularCategories = ({ categories, isEmirate = false, emirate }) => {
  const navigate = useNavigate();

  const handleSubCategoryClick = (e, category, subCategory) => {
    e.preventDefault();
    if (
      category.name.toLowerCase() === "jobs" &&
      subCategory.name.toLowerCase() === "i want a job"
    ) {
      navigate("/jobs/main");
    } else if (
      category.name.toLowerCase() === "jobs" &&
      subCategory.name.toLowerCase() === "i'm hiring"
    ) {
      navigate(`/hire-talent/i-want-a-job`);
    } else if (category.name.toLowerCase().includes("health")) {
      navigate(
        `/health-care/services/category/${subCategory.slug}?city=${emirate}`
      );
    } else if (category.name.toLowerCase().includes("vehicles")) {
      navigate(
        `/garage/all-services?category=${subCategory.slug}&city=${emirate}`
      );
    } else {
      const normalizedCategoryName = category.slug;
      const normalizedSubCategoryName = subCategory.slug;
      navigate(
        `/all-listings/?store=${normalizedCategoryName}&category=${normalizedSubCategoryName}&city=${emirate}`
      );
    }
  };

  const handleClickOnAll = (store) => {
    if (store.name.toLowerCase().includes("health")) {
      navigate(`/health-care`);
    } else if (store.name.toLowerCase().includes("vehicles")) {
      navigate(`/garage`);
    } else {
      navigate(`/category/${store.slug}`);
    }
  };

  return (
    <div className="section-container">
      {!isEmirate && <h2 className="section-heading">Popular Categories</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8 md:gap-10 lg:gap-12 gap-y-12 sm:gap-y-16 md:gap-y-16 lg:gap-y-20 my-6 sm:my-10 md:my-14 lg:my-18 justify-center">
        {categories.map((store) => (
          <div
            key={store.id}
            className="flex flex-col justify-between gap-3 sm:gap-4 p-4 sm:p-0 rounded-xl bg-white/50 sm:bg-transparent shadow-sm sm:shadow-none border border-gray-100 sm:border-0"
          >
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-center">
                <div className="bg-primary/10 p-2 rounded-full sm:bg-transparent sm:p-0">
                  <img
                    src={store.icon?.url || "/default-store-icon.png"}
                    alt={store.name}
                    className="w-5 md:w-8 lg:w-10"
                  />
                </div>
                <h3 className="text-base font-semibold capitalize lh-[0.6]">
                  {store.name}
                </h3>
              </div>

              <div className="flex flex-col gap-2 sm:gap-1 pl-2 sm:pl-0">
                {store.categories &&
                  Array.isArray(store.categories) &&
                  store.categories.map((category) => {
                    const normalizedStoreName = store.name.replace(/\s+/g, "-");
                    const normalizedSubCategoryName =
                      category.name?.replace(/\s+/g, "-") || "";
                    let linkUrl = `/all-listings/?category=${normalizedStoreName}&subCategory=${normalizedSubCategoryName}`;

                    if (
                      store.name.toLowerCase() === "jobs" &&
                      category.name.toLowerCase() === "i want a job"
                    ) {
                      linkUrl = "/jobs/main";
                    } else if (
                      store.name.toLowerCase() === "jobs" &&
                      category.name.toLowerCase() === "i'm hiring"
                    ) {
                      linkUrl = "/hire-talent";
                    }

                    return (
                      <Link
                        key={category._id}
                        to={linkUrl}
                        onClick={(e) =>
                          handleSubCategoryClick(
                            e,
                            { ...store },
                            { ...category }
                          )
                        }
                        className='text-dark text-sm hover:text-primary transition-colors duration-300 flex items-center gap-1 before:content-["•"] before:text-primary/70 sm:before:content-none'
                      >
                        {category.name}
                      </Link>
                    );
                  })}
                {(!store.categories ||
                  !Array.isArray(store.categories) ||
                  store.categories.length === 0) && (
                  <span className="text-gray-500 text-sm italic">
                    No categories available
                  </span>
                )}
                {store.name !== "Jobs" && (
                  <button
                    onClick={() => handleClickOnAll(store)}
                    className="text-primary py-2 sm:py-[6px] rounded-full flex gap-2 text-sm w-full sm:w-auto mt-1 sm:mt-0"
                  >
                    <span>All in {store.name}</span>
                    <HiOutlineArrowLongRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularCategories;
