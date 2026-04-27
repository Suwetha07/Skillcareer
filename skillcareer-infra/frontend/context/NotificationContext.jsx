import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

const NotificationContext = createContext(null);

function NotificationViewport({ notifications, removeNotification }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-3">
      {notifications.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto rounded-[1.4rem] border px-4 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl ${
            item.type === 'error'
              ? 'border-rose-400/30 bg-rose-500/15 text-rose-50'
              : item.type === 'success'
                ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-50'
                : 'border-[#ff916d]/30 bg-[linear-gradient(135deg,rgba(255,0,184,0.2),rgba(255,145,109,0.18))] text-white'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold">{item.title}</p>
              {item.message ? <p className="mt-1 text-sm opacity-90">{item.message}</p> : null}
            </div>
            <button onClick={() => removeNotification(item.id)} className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 hover:opacity-100">
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const nextId = useRef(1);

  const removeNotification = (id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  };

  const notify = ({ title, message = '', type = 'info', duration = 3000 }) => {
    const id = nextId.current += 1;
    setNotifications((current) => [...current, { id, title, message, type }]);
    window.setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const value = useMemo(() => ({ notify }), []);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationViewport notifications={notifications} removeNotification={removeNotification} />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
