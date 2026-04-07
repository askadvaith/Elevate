import { Capacitor } from '@capacitor/core';
import {
  LocalNotifications,
  type LocalNotificationSchema,
  type PendingLocalNotificationSchema,
} from '@capacitor/local-notifications';
import { format, isValid, parse, subMinutes } from 'date-fns';
import { Task } from '../types';

const CHANNEL_ID = 'todo-reminders';
const ID_SALT = 7300;

const getNotificationId = (taskId: string) => {
  let hash = ID_SALT;
  for (let index = 0; index < taskId.length; index += 1) {
    hash = ((hash << 5) - hash + taskId.charCodeAt(index)) | 0;
  }

  return Math.abs(hash) % 2147483000;
};

const isNativePlatform = () => Capacitor.getPlatform() !== 'web';

const parseTaskDateTime = (task: Task): Date | null => {
  if (!task.time || task.time === 'Anytime' || task.time === 'Done') {
    return null;
  }

  const withTwelveHour = parse(`${task.dueDate} ${task.time}`, 'yyyy-MM-dd h:mm a', new Date());
  if (isValid(withTwelveHour)) {
    return withTwelveHour;
  }

  const withTwentyFourHour = parse(`${task.dueDate} ${task.time}`, 'yyyy-MM-dd HH:mm', new Date());
  if (isValid(withTwentyFourHour)) {
    return withTwentyFourHour;
  }

  return null;
};

const buildScheduledNotification = (task: Task): LocalNotificationSchema | null => {
  if (task.completed || task.reminderEnabled === false) {
    return null;
  }

  const dueAt = parseTaskDateTime(task);
  if (!dueAt) {
    return null;
  }

  const offsetMinutes = task.reminderOffsetMinutes ?? 15;
  const remindAt = subMinutes(dueAt, offsetMinutes);

  if (remindAt.getTime() <= Date.now()) {
    return null;
  }

  return {
    id: getNotificationId(task.id),
    title: 'Task reminder',
    body: `${task.title} is due ${format(dueAt, 'PPp')}`,
    schedule: {
      at: remindAt,
      allowWhileIdle: true,
    },
    channelId: CHANNEL_ID,
    extra: {
      taskId: task.id,
    },
  };
};

const toCancelPayload = (notifications: PendingLocalNotificationSchema[]) => ({
  notifications: notifications.map((notification) => ({
    id: notification.id,
  })),
});

let initialized = false;

export const ensureReminderPermission = async () => {
  if (!isNativePlatform()) {
    return;
  }

  if (!initialized) {
    initialized = true;

    if (Capacitor.getPlatform() === 'android') {
      await LocalNotifications.createChannel({
        id: CHANNEL_ID,
        name: 'Task reminders',
        description: 'Reminders for upcoming tasks',
        importance: 5,
        visibility: 1,
      });
    }
  }

  const permissions = await LocalNotifications.checkPermissions();
  if (permissions.display !== 'granted') {
    await LocalNotifications.requestPermissions();
  }
};

export const syncTaskReminders = async (tasks: Task[]) => {
  if (!isNativePlatform()) {
    return;
  }

  await ensureReminderPermission();

  const permissions = await LocalNotifications.checkPermissions();
  if (permissions.display !== 'granted') {
    return;
  }

  const pendingResult = await LocalNotifications.getPending();
  const pendingNotifications = pendingResult.notifications;

  if (pendingNotifications.length > 0) {
    await LocalNotifications.cancel(toCancelPayload(pendingNotifications));
  }

  const nextNotifications = tasks
    .map((task) => buildScheduledNotification(task))
    .filter((notification): notification is LocalNotificationSchema => notification !== null);

  if (nextNotifications.length === 0) {
    return;
  }

  await LocalNotifications.schedule({
    notifications: nextNotifications,
  });
};
