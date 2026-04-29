import { useEffect } from 'react';
import { db } from '../db';

export const useNotifications = () => {
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    const checkReminders = async () => {
      const now = new Date();
      
      const checkDays = [1, 2]; // 1 day before, 2 days before
      
      for (const dayCount of checkDays) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + dayCount);
        const targetStr = targetDate.toISOString().split('T')[0];

        const sessions = await db.sessions
          .where('gregorianDate')
          .equals(targetStr)
          .toArray();

        sessions.forEach(session => {
          if (Notification.permission === 'granted') {
            const timeLabel = dayCount === 1 ? 'غداً' : 'بعد غد';
            new Notification(`تنبيه: دورة قريباً (${timeLabel})`, {
              body: `${timeLabel} لديك دورة "${session.courseTitle}" في "${session.schoolName}"`,
              icon: '/icon.png'
            });
          }
        });
      }
    };

    // Check once an hour
    const interval = setInterval(checkReminders, 1000 * 60 * 60);
    
    // Also check on mount
    checkReminders();

    return () => clearInterval(interval);
  }, []);

  const sendImmediateNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  return { sendImmediateNotification };
};
