import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { navLinks } from "../../../data/navigationData";
import StoreDropdown from "./StoreDropdown";
import NavigationShimmer from "./NavigationShimmer";
import { logoutUser } from "../../../features/auth/authSlice";
import { useAuth0 } from "@auth0/auth0-react";
import { getStores } from "../../../features/admin/storesSlice";

const Header = () => {
  const { logout: auth0Logout } = useAuth0();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePath, setActivePath] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { navbarStores: stores } = useSelector((state) => state.adminStores);

  useEffect(() => {
    const fetchStoresData = async () => {
      try {
        await dispatch(getStores({ root: true })).unwrap();
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    // Only fetch if we don't have stores data yet
    if (!stores || stores.length === 0) {
      fetchStoresData();
    }
  }, [dispatch, stores]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const shouldBeScrolled = scrollTop > 20;
      const shouldBeCompact = scrollTop > 100;

      setIsScrolled(shouldBeScrolled);
      setIsCompact(shouldBeCompact);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    handleResize();
    handleScroll();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleItemHover = (newPath) => {
    setActivePath(newPath);
  };

  const handleMouseLeave = () => {
    setActivePath([]);
  };
  const handleLogout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });

    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        localStorage.clear();
        window.location.reload();
      })
      .catch((error) => {
        console.error("Redux logout failed:", error);
        localStorage.clear();
        window.location.reload();
      });
  };

  return (
    <>
      <header
        className={`w-full bg-white fixed top-0 left-0 right-0 z-50 header-compact-transition ${
          isScrolled ? "shadow-lg" : "shadow-sm"
        }`}
      >
        {/* First Row - Logo and Main Navigation */}
        <div
          className={`border-b border-gray-100 transition-all duration-300 ${
            isCompact ? "border-opacity-50" : ""
          }`}
        >
          <div
            className={`max-w-7xl mx-auto flex items-center justify-between px-4 transition-all duration-300 ${
              isCompact ? "py-2" : "py-3"
            }`}
          >
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center no-underline">
                <img
                  src="/rixdu-logo.png"
                  alt="Rixdu"
                  className={`mr-2 transition-all duration-300 ${
                    isCompact ? "h-8" : "h-10"
                  }`}
                />
              </Link>
            </div>

            {/* Main Navigation */}
            <div className="flex gap-3 items-center justify-center">
              <nav className="hidden md:flex justify-center items-center gap-2">
                {navLinks.map((navLink, index) => (
                  <Link
                    key={index}
                    to={navLink.to}
                    className="flex items-center justify-center capitalize text-dark text-xs no-underline p-1.5 rounded-lg transition-all duration-300 hover:bg-blue-50 hover:text-[var(--color-primary)] gap-1"
                  >
                    <img
                      src={navLink.icon}
                      alt="header icon"
                      className="w-3.5 h-3.5 mb-0"
                      style={{ alignSelf: "center" }}
                    />
                    <p className="m-0 flex items-center text-xs">
                      {navLink.text}
                    </p>
                  </Link>
                ))}
              </nav>{" "}
              {/* Auth Buttons */}
              <div className="hidden md:flex items-center gap-2">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/auth/login"
                      className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-medium text-sm px-3 py-2 rounded-lg transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/auth/verify-method"
                      className="btn-primary text-sm"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/place-ad" className="btn-primary text-sm">
                      Place Your Ad
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-medium text-sm px-3 py-2 rounded-lg transition-colors border border-[var(--color-primary)] hover:bg-blue-50"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
              {/* Mobile Menu Button */}
              <button
                className="md:hidden flex items-center text-gray-700"
                onClick={toggleSidebar}
                aria-label="Toggle menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Second Row - Category Navigation */}
        <div
          className={`bg-gray-50 border-b border-gray-100 transition-all duration-300`}
        >
          <div className="max-w-7xl mx-auto">
            <nav
              className={`hidden md:flex items-center justify-center px-4 transition-all duration-300 ${
                isCompact ? "py-1.5" : "py-3"
              }`}
            >
              <div
                className={`flex items-center relative transition-all duration-300 ${
                  isCompact ? "gap-1 lg:gap-1.5" : "gap-1.5 lg:gap-2 xl:gap-3"
                }`}
              >
                {isCompact ? (
                  // Minimal categories when scrolling - Show shimmer if no stores
                  stores && stores.length > 0 ? (
                    (() => {
                      const displayedItems = stores.slice(0, 6);

                      return (
                        <>
                          <span className="text-xs font-medium text-gray-600 mr-2">
                            Categories:
                          </span>
                          {displayedItems.map((item) => {
                            // Handle store data structure
                            const itemName = item.name;
                            const itemIcon = item.icon?.url;
                            // Special handling for specific stores
                            let itemLink;
                            if (itemName?.toLowerCase() === "jobs") {
                              itemLink = "/jobs/categories";
                            } else if (
                              itemName?.toLowerCase().includes("health") &&
                              itemName?.toLowerCase().includes("care")
                            ) {
                              itemLink = "/health-care";
                            } else if (
                              itemName?.toLowerCase().includes("vehicles")
                            ) {
                              itemLink = `/garage`;
                            } else {
                              itemLink = `/category/${item.slug}`;
                            }
                            const itemKey = item._id;

                            return (
                              <Link
                                key={itemKey}
                                to={itemLink}
                                className="flex items-center gap-0.5 px-1.5 py-1 text-xs font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors duration-300 no-underline whitespace-nowrap"
                              >
                                <img
                                  src={itemIcon}
                                  alt={itemName}
                                  className="w-2.5 h-2.5"
                                />
                                <span>{itemName}</span>
                              </Link>
                            );
                          })}
                          {stores.length > 6 && (
                            <button
                              onClick={() =>
                                window.scrollTo({ top: 0, behavior: "smooth" })
                              }
                              className="text-xs text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-medium px-2 py-1"
                            >
                              +{stores.length - 6} more
                            </button>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <NavigationShimmer isCompact={true} />
                  )
                ) : // Full categories when not scrolling - Show shimmer if no stores
                stores && stores.length > 0 ? (
                  stores.map((store, index) => (
                    <StoreDropdown
                      key={store._id}
                      store={store}
                      isActive={
                        activePath.length > 0 && activePath[0] === store._id
                      }
                      activePath={activePath}
                      onItemHover={handleItemHover}
                      onMouseLeave={handleMouseLeave}
                      index={index}
                      totalStores={stores.length}
                      depth={0}
                    />
                  ))
                ) : (
                  // Show shimmer if stores not loaded
                  <NavigationShimmer isCompact={false} />
                )}
              </div>
            </nav>

            {/* Mobile Category Navigation */}
            <div className="md:hidden px-4 py-2">
              <div className="flex overflow-x-auto gap-2 hide-scrollbar category-scroll relative">
                {stores && stores.length > 0
                  ? stores.map((item) => {
                      // Handle store data structure
                      const itemName = item.name;
                      const itemIcon = item.icon?.url;
                      // Special handling for specific stores
                      let itemLink;
                      if (itemName?.toLowerCase() === "jobs") {
                        itemLink = "/jobs/categories";
                      } else if (
                        itemName?.toLowerCase().includes("health") &&
                        itemName?.toLowerCase().includes("care")
                      ) {
                        itemLink = "/health-care";
                      } else if (itemName?.toLowerCase().includes("vehicles")) {
                        itemLink = `/garage`;
                      } else {
                        itemLink = `/category/${item.slug}`;
                      }
                      const itemKey = item._id;

                      return (
                        <Link
                          key={itemKey}
                          to={itemLink}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors duration-300 no-underline whitespace-nowrap"
                        >
                          <img
                            src={itemIcon}
                            alt={itemName}
                            className="w-3.5 h-3.5"
                          />
                          <span>{itemName}</span>
                        </Link>
                      );
                    })
                  : // Show shimmer loading items for mobile
                    Array.from({ length: 4 }, (_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 animate-pulse"
                      >
                        <div className="w-3.5 h-3.5 bg-gray-200 rounded"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 z-50 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeSidebar}
      ></div>
      <div
        className={`rounded-tl-2xl rounded-bl-2xl fixed top-0 right-0 h-full w-[320px] max-h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <Link to="/" className="flex items-center" onClick={closeSidebar}>
            <img src="/rixdu-logo.png" alt="Rixdu" className="h-8" />
          </Link>
          <button
            className="text-gray-600"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>{" "}
        {/* Mobile Navigation */}
        <div className="flex flex-col h-[calc(100%-64px)] overflow-y-auto scrollbar-hide">
          <div className="flex flex-col h-full">
            <nav className="flex flex-col mt-4">
              {navLinks.map((navLink, index) => (
                <Link
                  key={index}
                  to={navLink.to}
                  className="flex items-center capitalize py-3 px-6 hover:bg-blue-50 hover:text-[var(--color-primary)] text-gray-700 no-underline"
                  onClick={closeSidebar}
                >
                  <img
                    src={navLink.icon}
                    alt={`${navLink.text} icon`}
                    className="w-5 h-5 mr-3"
                  />
                  <span>{navLink.text}</span>
                </Link>
              ))}
            </nav>{" "}
            {/* Categories */}
            <div className="border-t mt-4 pt-4 flex-1">
              <h3 className="px-6 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Categories
              </h3>
              {stores && stores.length > 0
                ? stores.map((item) => {
                    // Handle store data structure
                    const itemName = item.name;
                    const itemIcon = item.icon?.url;
                    // Special handling for specific stores
                    let itemLink;
                    if (itemName?.toLowerCase() === "jobs") {
                      itemLink = "/jobs/categories";
                    } else if (
                      itemName?.toLowerCase().includes("health") &&
                      itemName?.toLowerCase().includes("care")
                    ) {
                      itemLink = "/health-care";
                    } else if (itemName?.toLowerCase().includes("vehicles")) {
                      itemLink = `/garage`;
                    } else {
                      itemLink = `/category/${item.slug}`;
                    }
                    const itemKey = item._id;

                    return (
                      <Link
                        key={itemKey}
                        to={itemLink}
                        className="flex items-center py-3 px-6 hover:bg-blue-50 hover:text-[var(--color-primary)] text-gray-700 no-underline"
                        onClick={closeSidebar}
                      >
                        <img
                          src={itemIcon}
                          alt={itemName}
                          className="w-5 h-5 mr-3"
                        />
                        <span>{itemName}</span>
                      </Link>
                    );
                  })
                : // Show shimmer loading items for sidebar
                  Array.from({ length: 4 }, (_, index) => (
                    <div
                      key={index}
                      className="flex items-center py-3 px-6 animate-pulse"
                    >
                      <div className="w-5 h-5 bg-gray-200 rounded mr-3"></div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
            </div>{" "}
            {/* Auth Buttons */}
            <div className="border-t mt-4 pt-4 px-6">
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <Link
                    to="/auth/login"
                    className="block w-full text-center py-2 px-4 text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg hover:bg-blue-50 transition-colors no-underline"
                    onClick={closeSidebar}
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="btn-primary w-full text-center block"
                    onClick={closeSidebar}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/place-ad"
                    className="btn-primary w-full text-center block"
                    onClick={closeSidebar}
                  >
                    Place Your Ad
                  </Link>{" "}
                  <button
                    onClick={() => {
                      console.log("🔐 Mobile sidebar: Logout initiated");
                      handleLogout();
                      closeSidebar();
                    }}
                    className="block w-full text-center py-2 px-4 text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>{" "}
            <div className="mt-auto pt-6 pb-4 text-center text-gray-400 text-xs">
              Rixdu App v1.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
