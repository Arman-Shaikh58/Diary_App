import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:permission_handler/permission_handler.dart';

/// Service to handle daily diary reminder notifications.
///
/// Schedules a notification every day at 10:00 PM with a random
/// motivational message encouraging the user to write in their diary.
class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  /// Pool of friendly evening reminder messages
  static const List<String> _reminderMessages = [
    'How was your day? 📝',
    'Take a moment to reflect on today ✨',
    'Your diary is waiting for you 🌙',
    'Write down your thoughts before bed 💭',
    'Capture today\'s memories before they fade 📖',
    'A few words today, a treasure tomorrow 🌟',
  ];

  /// Initialize the notification plugin and timezone data
  Future<void> initialize() async {
    // Initialize timezone database
    tz.initializeTimeZones();

    // Android initialization settings
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');

    // iOS initialization settings
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    debugPrint('📱 NotificationService initialized');
  }

  /// Handle notification tap
  void _onNotificationTapped(NotificationResponse response) {
    debugPrint('Notification tapped: ${response.payload}');
    // The app will open naturally since it's already set as the launch intent
  }

  /// Request notification permission (required for Android 13+)
  Future<bool> requestPermission() async {
    final status = await Permission.notification.request();
    debugPrint('Notification permission: $status');
    return status.isGranted;
  }

  /// Schedule daily notification at 10:00 PM local time.
  ///
  /// Schedules 6 notifications (one per day for next 6 days) with
  /// different messages, then relies on the app reopening to reschedule.
  Future<void> scheduleDailyReminder() async {
    // Cancel any existing scheduled notifications first
    await _notifications.cancelAll();

    final now = tz.TZDateTime.now(tz.local);

    for (int i = 0; i < _reminderMessages.length; i++) {
      // Calculate the next 10 PM for day i
      var scheduledDate = tz.TZDateTime(
        tz.local,
        now.year,
        now.month,
        now.day,
        22, // 10 PM
        0,
        0,
      );

      // Add i days
      scheduledDate = scheduledDate.add(Duration(days: i));

      // If the time has already passed today, start from tomorrow
      if (scheduledDate.isBefore(now)) {
        scheduledDate = scheduledDate.add(const Duration(days: 1));
      }

      await _notifications.zonedSchedule(
        i, // unique notification ID
        'My Diary',
        _reminderMessages[i],
        scheduledDate,
        _notificationDetails(),
        androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        matchDateTimeComponents: DateTimeComponents.time,
        payload: 'daily_reminder_$i',
      );

      debugPrint(
        '🔔 Scheduled notification $i: "${_reminderMessages[i]}" at $scheduledDate',
      );
    }
  }

  /// Build platform-specific notification display details
  NotificationDetails _notificationDetails() {
    return const NotificationDetails(
      android: AndroidNotificationDetails(
        'daily_diary_reminder', // channel ID
        'Daily Diary Reminder', // channel name
        channelDescription: 'Reminds you to write in your diary every evening',
        importance: Importance.high,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
        styleInformation: BigTextStyleInformation(''),
        category: AndroidNotificationCategory.reminder,
        visibility: NotificationVisibility.public,
      ),
      iOS: DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      ),
    );
  }

  /// Send an immediate test notification (useful for debugging)
  Future<void> showTestNotification() async {
    final random = Random();
    final message = _reminderMessages[random.nextInt(_reminderMessages.length)];

    await _notifications.show(
      99, // test notification ID
      'My Diary',
      message,
      _notificationDetails(),
      payload: 'test_notification',
    );

    debugPrint('🧪 Test notification sent: "$message"');
  }

  /// Cancel all scheduled notifications
  Future<void> cancelAll() async {
    await _notifications.cancelAll();
    debugPrint('🚫 All notifications cancelled');
  }
}
