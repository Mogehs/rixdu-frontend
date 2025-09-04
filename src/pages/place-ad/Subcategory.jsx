import React, { useEffect } from "react";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import homeIcon from "../../assets/icons/home.svg"; // Adjust path
import { fetchCategoryChildrenBySlug } from "../../features/admin/categoriesSlice";

const Subcategory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { city, category } = useParams();

  const { currentCategory, loading } = useSelector(
    (state) => state.adminCategories
  );

  const path = location.pathname;
  const subcategoryPath = path.split("/subcategory/")[1] || "";
  const slugSegments = subcategoryPath.split("/").filter(Boolean);

  const currentSlug = slugSegments[slugSegments.length - 1]; // Last slug used for API

  useEffect(() => {
    if (currentSlug) {
      dispatch(fetchCategoryChildrenBySlug({ slug: currentSlug }));
    }
  }, [dispatch, currentSlug, location.pathname]);

  const handleSubcategorySelect = (subcategory) => {
    const currentSubPath = location.pathname.split("/subcategory/")[1];
    if (subcategory.isLeaf) {
      navigate(
        `/place-ad/form/${city}/${category}/${currentSubPath}/${subcategory.slug}`
      );
    } else {
      const newPath = `/place-ad/${city}/${category}/subcategory/${slugSegments
        .concat(subcategory.slug)
        .join("/")}`;
      navigate(newPath);
    }
  };

  const getBreadcrumbItems = () => {
    const base = [
      { icon: homeIcon, link: "/place-ad" },
      { text: category, link: `/place-ad/${city}/${category}` },
    ];

    const subcategoryLinks = slugSegments.map((slug, index) => ({
      text: slug.replace(/-/g, " "), // Optional: format slug for display
      link: `/place-ad/${city}/${category}/subcategory/${slugSegments
        .slice(0, index + 1)
        .join("/")}`,
    }));

    return [...base, ...subcategoryLinks];
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
          {currentCategory && currentCategory.length > 0 ? (
            currentCategory.map((subcategory) => (
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
            <div className="text-center text-[var(--color-dark)] text-lg font-medium bg-[var(--color-light)] p-4 rounded-lg shadow-inner">
              🚧 This section is currently under construction. Please check back
              soon.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Subcategory;
