import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'diary_service.dart';
import 'dart:io';

/// A queue item representing a pending operation (save or image upload).
class QueueItem {
  final String type; // 'save' or 'image_upload'
  final Map<String, dynamic> payload;
  int retryCount;
  final String createdAt;

  QueueItem({
    required this.type,
    required this.payload,
    this.retryCount = 0,
    String? createdAt,
  }) : createdAt = createdAt ?? DateTime.now().toIso8601String();

  Map<String, dynamic> toJson() => {
        'type': type,
        'payload': payload,
        'retryCount': retryCount,
        'createdAt': createdAt,
      };

  factory QueueItem.fromJson(Map<String, dynamic> json) => QueueItem(
        type: json['type'],
        payload: Map<String, dynamic>.from(json['payload']),
        retryCount: json['retryCount'] ?? 0,
        createdAt: json['createdAt'],
      );
}

/// Service that manages an offline queue for diary saves and image uploads.
///
/// When a save/upload fails (e.g. no internet), the operation is stored
/// locally and retried automatically when connectivity is restored.
class UploadQueueService {
  UploadQueueService._();
  static final UploadQueueService instance = UploadQueueService._();

  static const String _queueKey = 'upload_queue';
  static const int _maxRetries = 5;

  final DiaryService _diaryService = DiaryService();
  final Connectivity _connectivity = Connectivity();
  StreamSubscription? _connectivitySub;
  bool _isDraining = false;

  /// Initialize the queue and start listening for connectivity changes.
  Future<void> initialize() async {
    _connectivitySub = _connectivity.onConnectivityChanged.listen((results) {
      // results is List<ConnectivityResult>
      final hasInternet = results.any((r) => r != ConnectivityResult.none);
      if (hasInternet) {
        debugPrint('🌐 Internet restored — draining offline queue');
        drainQueue();
      }
    });

    // Try draining on startup in case there are pending items
    drainQueue();
  }

  void dispose() {
    _connectivitySub?.cancel();
  }

  // ─── Queue Persistence ─────────────────────────────────────────────

  Future<List<QueueItem>> _loadQueue() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_queueKey) ?? [];
    return raw.map((s) => QueueItem.fromJson(jsonDecode(s))).toList();
  }

  Future<void> _saveQueue(List<QueueItem> queue) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = queue.map((q) => jsonEncode(q.toJson())).toList();
    await prefs.setStringList(_queueKey, raw);
  }

  Future<void> _addToQueue(QueueItem item) async {
    final queue = await _loadQueue();
    queue.add(item);
    await _saveQueue(queue);
    debugPrint('📥 Queued offline: ${item.type} (${queue.length} in queue)');
  }

  // ─── Public API ────────────────────────────────────────────────────

  /// Save a diary entry. Returns the saved entry data on success, null on failure.
  /// If saving fails, the operation is queued for retry.
  Future<Map<String, dynamic>?> saveEntry({
    required String entryDate,
    required String content,
    String? title,
    String? mood,
  }) async {
    try {
      final result = await _diaryService.saveEntry(
        entryDate: entryDate,
        content: content,
        title: title,
        mood: mood,
      );
      return result;
    } catch (e) {
      debugPrint('⚠️ Save failed, queuing: $e');
      await _addToQueue(QueueItem(
        type: 'save',
        payload: {
          'entryDate': entryDate,
          'content': content,
          'title': title,
          'mood': mood,
        },
      ));
      return null;
    }
  }

  /// Upload images to an entry. Returns uploaded image data on success.
  /// If upload fails, the file paths are queued for retry.
  Future<List<Map<String, dynamic>>?> uploadImages({
    required String entryId,
    required List<File> images,
  }) async {
    try {
      return await _diaryService.uploadImages(
        entryId: entryId,
        images: images,
      );
    } catch (e) {
      debugPrint('⚠️ Upload failed, queuing: $e');
      await _addToQueue(QueueItem(
        type: 'image_upload',
        payload: {
          'entryId': entryId,
          'imagePaths': images.map((f) => f.path).toList(),
        },
      ));
      return null;
    }
  }

  // ─── Queue Draining ────────────────────────────────────────────────

  /// Process all pending items in the queue.
  Future<void> drainQueue() async {
    if (_isDraining) return;
    _isDraining = true;

    try {
      final queue = await _loadQueue();
      if (queue.isEmpty) {
        _isDraining = false;
        return;
      }

      debugPrint('🔄 Draining queue: ${queue.length} items');
      final remaining = <QueueItem>[];

      for (final item in queue) {
        if (item.retryCount >= _maxRetries) {
          debugPrint('❌ Max retries reached, dropping: ${item.type}');
          continue;
        }

        bool success = false;
        try {
          if (item.type == 'save') {
            await _diaryService.saveEntry(
              entryDate: item.payload['entryDate'],
              content: item.payload['content'],
              title: item.payload['title'],
              mood: item.payload['mood'],
            );
            success = true;
          } else if (item.type == 'image_upload') {
            final paths = List<String>.from(item.payload['imagePaths']);
            final files = paths.map((p) => File(p)).where((f) => f.existsSync()).toList();
            if (files.isNotEmpty) {
              await _diaryService.uploadImages(
                entryId: item.payload['entryId'],
                images: files,
              );
              success = true;
            } else {
              // Files no longer exist, drop this item
              debugPrint('🗑️ Image files deleted, skipping upload');
              success = true;
            }
          }
        } catch (e) {
          debugPrint('⚠️ Retry failed for ${item.type}: $e');
        }

        if (!success) {
          item.retryCount++;
          remaining.add(item);
        } else {
          debugPrint('✅ Queue item completed: ${item.type}');
        }
      }

      await _saveQueue(remaining);
      debugPrint('📊 Queue drained: ${remaining.length} remaining');
    } finally {
      _isDraining = false;
    }
  }

  /// Get the number of pending items in the queue.
  Future<int> get pendingCount async {
    final queue = await _loadQueue();
    return queue.length;
  }
}
