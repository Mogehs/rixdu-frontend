import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ModernCalendar = ({
  selectedDate,
  onDateChange,
  className = "",
  dateAvailability = {},
  isCheckingAvailability = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth())
      : new Date()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper function to format date consistently without timezone issues
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    // Get the day of week (0 = Sunday, 1 = Monday, etc.)
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Convert to Monday-first week (Monday = 0, Sunday = 6)
    return day === 0 ? 6 : day - 1;
  };

  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isDateToday = (date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isDatePast = (date) => {
    return date < today;
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday (0) or Saturday (6)
  };

  const getDateAvailability = (date) => {
    // Use local date to avoid timezone issues
    const dateKey = formatLocalDate(date);
    return dateAvailability[dateKey] || { hasSlots: false, slotsCount: 0 };
  };

  const isDateAvailable = (date) => {
    if (isDatePast(date)) return false;
    if (isWeekend(date)) return false; // Disable weekends
    const availability = getDateAvailability(date);
    return availability.hasSlots;
  };

  const handleDateClick = (date) => {
    if (!isDatePast(date) && isDateAvailable(date) && onDateChange) {
      onDateChange(date);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);

  // Generate calendar days
  const calendarDays = [];

  // Previous month's trailing days
  const prevMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1
  );
  const daysInPrevMonth = getDaysInMonth(prevMonth);

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const date = new Date(
      prevMonth.getFullYear(),
      prevMonth.getMonth(),
      daysInPrevMonth - i
    );
    calendarDays.push({
      date,
      isCurrentMonth: false,
      isPast: isDatePast(date),
      isToday: isDateToday(date),
      isSelected: isDateSelected(date),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    calendarDays.push({
      date,
      isCurrentMonth: true,
      isPast: isDatePast(date),
      isToday: isDateToday(date),
      isSelected: isDateSelected(date),
    });
  }

  // Next month's leading days
  const remainingSlots = 42 - calendarDays.length; // 6 rows × 7 days = 42
  const nextMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1
  );

  for (let day = 1; day <= remainingSlots; day++) {
    const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
    calendarDays.push({
      date,
      isCurrentMonth: false,
      isPast: isDatePast(date),
      isToday: isDateToday(date),
      isSelected: isDateSelected(date),
    });
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <FaChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, index) => {
          const { date, isCurrentMonth, isPast, isToday, isSelected } = dayInfo;
          const availability = getDateAvailability(date);
          const hasSlots = availability.hasSlots;
          const isWeekendDay = isWeekend(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={isPast || !hasSlots || isWeekendDay}
              className={`
                aspect-square p-2 text-sm rounded-lg transition-all duration-200 relative
                ${
                  !isCurrentMonth
                    ? "text-gray-300 hover:text-gray-400"
                    : isPast
                    ? "text-gray-300 cursor-not-allowed"
                    : isWeekendDay
                    ? "text-gray-400 cursor-not-allowed bg-red-50 border border-red-100"
                    : !hasSlots && !isPast
                    ? "text-gray-400 cursor-not-allowed bg-gray-50"
                    : isSelected
                    ? "bg-blue-500 text-white shadow-md"
                    : isToday
                    ? hasSlots
                      ? "bg-blue-50 text-blue-600 font-semibold border border-blue-200"
                      : "bg-gray-100 text-gray-500 font-semibold border border-gray-200"
                    : hasSlots
                    ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    : "text-gray-400 bg-gray-50"
                }
                ${
                  isCurrentMonth &&
                  hasSlots &&
                  !isPast &&
                  !isSelected &&
                  !isWeekendDay
                    ? "hover:shadow-sm"
                    : ""
                }
              `}
            >
              {date.getDate()}
              {isToday && !isSelected && (
                <div
                  className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                    hasSlots && !isWeekendDay ? "bg-blue-500" : "bg-gray-400"
                  }`}
                ></div>
              )}
              {/* Availability indicator */}
              {isCurrentMonth &&
                !isPast &&
                !isSelected &&
                !isWeekendDay &&
                hasSlots &&
                availability.slotsCount > 0 && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              {/* Weekend indicator */}
              {isCurrentMonth && !isPast && !isSelected && isWeekendDay && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full"></div>
              )}
              {/* Loading indicator */}
              {isCurrentMonth && !isPast && isCheckingAvailability && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                  <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-center gap-3 text-xs text-gray-500 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded-sm"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-50 border border-red-100 rounded-sm"></div>
            <span>Weekend</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded-sm"></div>
            <span>No slots</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernCalendar;
