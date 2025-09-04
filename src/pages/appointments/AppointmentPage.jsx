import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// bookings slice thunks
import {
  getUserBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
} from "../../features/bookings/bookingsSlice";
import Modal from "../../components/common/Modal";
import { getOrCreateChat } from "../../features/chats/chatsSlice";

const AppointmentsPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("my-appointments");
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const user = useSelector((state) => state.auth.user);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Booking state and fetch refs
  const bookingsState = useSelector((state) => state.bookings);
  const { userBookings, providerBookings, loading, error } =
    bookingsState || {};
  const { isAuthenticated } = useSelector((state) => state.auth);
  const hasFetchedMy = useRef(false);
  const hasFetchedReceived = useRef(false);

  // Fetch bookings only once when authenticated
  useEffect(() => {
    if (isAuthenticated && !hasFetchedMy.current) {
      dispatch(getUserBookings());
      hasFetchedMy.current = true;
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (
      isAuthenticated &&
      activeTab === "received-appointments" &&
      !hasFetchedReceived.current
    ) {
      dispatch(getProviderBookings({ doctorId: user.id }));
      hasFetchedReceived.current = true;
    }
  }, [dispatch, isAuthenticated, activeTab]);

  // Status color helper
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle appointment actions
  const handleAppointmentAction = async (
    appointmentId,
    action,
    newStatus = null
  ) => {
    if (!isAuthenticated) {
      toast.info("Please login to manage appointments");
      return;
    }

    if (isProcessingAction) return;
    setIsProcessingAction(true);

    try {
      if (action === "cancel") {
        await dispatch(cancelBooking(appointmentId)).unwrap();
        toast.success("Appointment cancelled successfully");
      } else if (action === "update-status") {
        await dispatch(
          updateBookingStatus({ bookingId: appointmentId, status: newStatus })
        ).unwrap();
        toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
      }
    } catch (err) {
      const msg = err?.message || err || "An error occurred";
      toast.error(`Error: ${msg}`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    const currentAppointments =
      activeTab === "my-appointments"
        ? userBookings || []
        : providerBookings || [];

    if (filterStatus === "all") return currentAppointments;

    return currentAppointments.filter(
      (appointment) => appointment.status?.toLowerCase() === filterStatus
    );
  }, [userBookings, providerBookings, activeTab, filterStatus]);

  // Render appointment card
  const renderAppointmentCard = (appointment, index) => (
    <div
      key={appointment._id || index}
      className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
    >
      {console.log(appointment)}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === "my-appointments"
              ? `Appointment with ${appointment.doctor?.name || "Provider"}`
              : `Appointment request from ${
                  appointment.patientInfo?.name || "Customer"
                }`}
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">Date:</span>{" "}
              {console.log(appointment)}
              {formatDate(appointment.date)}
            </p>
            <p>
              <span className="font-medium">Consultation Type:</span>{" "}
              {appointment.consultationType || "Not specified"}
            </p>
            {appointment.location && (
              <p>
                <span className="font-medium">Location:</span>{" "}
                {appointment.location}
              </p>
            )}
            {appointment.notes && (
              <p>
                <span className="font-medium">Notes:</span> {appointment.notes}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              appointment.status
            )}`}
          >
            {appointment.status || "Pending"}
          </span>
          {appointment.amount && (
            <span className="text-lg font-bold text-[var(--color-secondary)]">
              ${appointment.amount}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
        {activeTab === "my-appointments" ? (
          // Actions for appointments you made
          <>
            {appointment.status?.toLowerCase() === "pending" && (
              <button
                onClick={() =>
                  handleAppointmentAction(appointment._id, "cancel", "cancel")
                }
                disabled={isProcessingAction}
                className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => {
                setSelectedAppointment(appointment);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              View Details
            </button>
          </>
        ) : (
          // Actions for appointments you received
          <>
            {appointment.status?.toLowerCase() === "pending" && (
              <>
                <button
                  onClick={() =>
                    handleAppointmentAction(
                      appointment._id,
                      "update-status",
                      "confirmed"
                    )
                  }
                  disabled={isProcessingAction}
                  className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    handleAppointmentAction(
                      appointment._id,
                      "update-status",
                      "cancelled"
                    )
                  }
                  disabled={isProcessingAction}
                  className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  Decline
                </button>
              </>
            )}
            {appointment.status?.toLowerCase() === "confirmed" && (
              <button
                onClick={() =>
                  handleAppointmentAction(
                    appointment._id,
                    "update-status",
                    "completed"
                  )
                }
                disabled={isProcessingAction}
                className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                Mark Complete
              </button>
            )}
            <Link
              to={`/appointment/${appointment._id}`}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors hidden"
            >
              View Details
            </Link>
            <button
              onClick={() => {
                setSelectedAppointment(appointment);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              View Details
            </button>
          </>
        )}
      </div>
    </div>
  );

  // Render content
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-500">
          Failed to load appointments: {error}
          <div className="mt-4">
            <button
              onClick={() => {
                if (activeTab === "my-appointments") {
                  hasFetchedMy.current = false;
                  dispatch(getUserBookings());
                  hasFetchedMy.current = true;
                } else {
                  hasFetchedReceived.current = false;
                  dispatch(getProviderBookings());
                  hasFetchedReceived.current = true;
                }
              }}
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-full hover:bg-secondary transition-colors shadow-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (!filteredAppointments || filteredAppointments.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {activeTab === "my-appointments"
              ? "You haven't made any appointments yet."
              : "You haven't received any appointment requests yet."}
          </p>
          <Link
            to="/all-listings"
            className="inline-block px-6 py-2.5 bg-primary text-white font-medium rounded-full hover:bg-secondary transition-colors shadow-sm"
          >
            {activeTab === "my-appointments"
              ? "Browse Consultations"
              : "Create Your Listing"}
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {filteredAppointments.map((appointment, index) =>
          renderAppointmentCard(appointment, index)
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Appointments</h1>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-3 px-6 font-medium text-base transition-colors ${
              activeTab === "my-appointments"
                ? "text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("my-appointments")}
          >
            My Appointments
          </button>
          <button
            className={`py-3 px-6 font-medium text-base transition-colors ${
              activeTab === "received-appointments"
                ? "text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("received-appointments")}
          >
            Received Requests
          </button>
        </div>
      </div>

      {/* Filter dropdown */}
      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {renderContent()}

      {/* Appointment Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        title={
          selectedAppointment ? `Appointment Details` : "Appointment Details"
        }
      >
        {selectedAppointment ? (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">
                <div>
                  <span className="font-medium">With:</span>{" "}
                  {activeTab === "my-appointments"
                    ? selectedAppointment.provider?.name || "Provider"
                    : selectedAppointment.requester?.name || "Customer"}
                </div>
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(selectedAppointment.date)}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  {selectedAppointment.status}
                </div>
                {selectedAppointment.notes && (
                  <div>
                    <span className="font-medium">Notes:</span>{" "}
                    {selectedAppointment.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              {/* Show Chat only for received requests (where current user is provider) */}
              {activeTab === "received-appointments" && (
                <button
                  onClick={async () => {
                    const currentUserId = user?.id || user?._id;
                    if (!currentUserId) {
                      toast.info("Please login to chat");
                      return;
                    }

                    // For received requests, the other party is the patient/requester
                    const receiverId = selectedAppointment.patient._id;
                    if (!receiverId) {
                      toast.error("No chat participant available");
                      return;
                    }

                    try {
                      const chat = await dispatch(
                        getOrCreateChat({
                          listingId: selectedAppointment.listing || null,
                          senderId: currentUserId,
                          receiverId,
                        })
                      ).unwrap();

                      setIsModalOpen(false);
                      setSelectedAppointment(null);
                      navigate(`/chat/${chat.slug}`);
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to start chat");
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Chat
                </button>
              )}

              <button
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AppointmentsPage;
