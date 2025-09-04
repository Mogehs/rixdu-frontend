import React, { useEffect } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchCategories } from "../../features/admin/categoriesSlice";
import { homeIcon } from "../../assets";

const SelectSubcategoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { city, category } = useParams();
  const { searchResults, loading } = useSelector(
    (state) => state.adminCategories
  );

  useEffect(() => {
    dispatch(
      searchCategories({
        storeSlug: category,
        isLeaf: false,
      })
    );
  }, [dispatch, category, location.pathname]);

  const getBreadcrumbItems = () => {
    const items = [
      { text: "", icon: homeIcon, link: "/place-ad" },
      { text: category, link: `/place-ad/${city}/${category}` },
    ];
    return items;
  };

  const renderBreadcrumb = () => {
    const items = getBreadcrumbItems();

    return (
      <div className="flex items-center gap-2 mb-6 capitalize">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-[var(--color-dark)]">{">"}</span>
            )}
            {item.icon ? (
              <Link to={item.link} className="hover:opacity-80">
                <img src={item.icon} alt="home" className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                to={item.link}
                className={`${
                  index === items.length - 1
                    ? "text-[var(--color-dark)] pointer-events-none"
                    : "text-[var(--color-primary)] hover:underline"
                }`}
              >
                {item.text}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const handleSubcategorySelect = (subcategory) => {
    if (subcategory.isLeaf) {
      navigate(`/place-ad/form/${city}/${category}`);
    } else {
      navigate(`/place-ad/${city}/${category}/subcategory/${subcategory.slug}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2 text-[var(--color-headings)] capitalize">
          Choose a {category} Category
        </h1>
        <p className="text-[var(--color-dark)]">
          Now choose the right category for your ad:
        </p>
      </div>

      {renderBreadcrumb()}

      {loading ? (
        <div className="text-center">Loading categories...</div>
      ) : (
        <div className="space-y-4">
          {searchResults && searchResults.length > 0 ? (
            searchResults.map((subcategory) => (
              <button
                key={subcategory._id}
                onClick={() => handleSubcategorySelect(subcategory)}
                className="w-full p-4 bg-[var(--color-white)] rounded-lg shadow-elegant border border-[var(--color-border)] flex items-center justify-between hover:border-[var(--color-primary)] transition-colors"
              >
                <span className="text-lg text-[var(--color-dark)]">
                  {subcategory.name}
                </span>
                <svg
                  className="w-6 h-6 text-[var(--color-dark)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))
          ) : (
            <div className="w-full p-6 text-center bg-[var(--color-white)] rounded-lg shadow-elegant border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-dark)] mb-2">
                🚧 This section is under construction
              </h2>
              <p className="text-[var(--color-muted)]">
                Our team is currently working to build out these categories.
                Please check back later!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectSubcategoryPage;
