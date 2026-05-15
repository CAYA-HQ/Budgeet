import { X } from "lucide-react";
import { useState } from "react";

const notifications = [
    {date: "20th", title:"Notification one"},
    {date: "20th", title:"Notification two"},
    {date: "20th", title:"Notification three"},
    {date: "20th", title:"Notification four"},
    {date: "20th", title:"Notification five"},
    {date: "20th", title:"Notification six"},
    {date: "20th", title:"Notification seven"},
]
function NotificationModal({ isModalOpen, setIsModalOpen }) {

  return (
    <>
      {isModalOpen && (
        <div className="notification-modal bg-[#00000099] w-full h-screen absolute inset-0 flex items-center justify-center z-50">
           <X className="text-red absolute top-10 right-10" onClick={() => setIsModalOpen(false)}/>
          <div className="notification-content">
            <h2 className="notification-header">
                Notification
            </h2>
            <div className="notification-body">
                {
                    notifications.map((notification, index) => (
                        <div key={index} className="notification-item">
                            <p className="notification-date">{notification.date}</p>
                            <p className="notification-title">{notification.title}</p>
                        </div>
                    ))
                }
                <button>View All</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationModal;
