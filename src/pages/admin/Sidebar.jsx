import React from "react";
import { MdStore, MdLogout, MdClose, MdAttachMoney } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ onClose, onNavigate }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const sidebarItems = [
    {
      id: "stores",
      title: "Stores",
      icon: MdStore,
      path: "/admin/stores",
      type: "single",
    },
    {
      id: "price-plans",
      title: "Price Plans",
      icon: MdAttachMoney,
      path: "/admin/price-plans",
      type: "single",
    },
  ];

  const handleItemClick = (item) => {
    // Handle navigation here when you implement routing
    console.log(`Navigate to: ${item.path}`);

    // Update the current view based on the item id
    if (onNavigate) {
      onNavigate(item.id);
    }

    // Close sidebar on mobile after navigation
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 h-screen overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm sm:text-base">
                Rixdu Admin
              </h2>
              <p className="text-xs text-gray-500">Management Panel</p>
            </div>
          </div>

          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <MdClose className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 sm:p-4 flex-1">
        <ul className="space-y-1 sm:space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <div
                onClick={() => handleItemClick(item)}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 group touch-manipulation"
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="text-lg sm:text-xl text-gray-600 group-hover:text-gray-900 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base text-gray-700 group-hover:text-gray-900">
                    {item.title}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-gray-50">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 font-medium text-xs sm:text-sm">
              {isAuthenticated ? user.name.charAt(0).toUpperCase() : "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-xs sm:text-sm text-gray-900 truncate">
              {isAuthenticated ? user.name : "Admin User"}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {isAuthenticated ? user.email : "admin@gmail.com"}
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded touch-manipulation flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <MdLogout className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
