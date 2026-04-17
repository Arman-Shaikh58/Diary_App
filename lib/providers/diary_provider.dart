import 'dart:io';
import 'package:flutter/material.dart';
import '../services/diary_service.dart';
import '../services/upload_queue_service.dart';

class DiaryProvider extends ChangeNotifier {
  final DiaryService _diaryService = DiaryService();
  final UploadQueueService _queueService = UploadQueueService.instance;

  // Month entries for calendar markers
  Map<String, List<Map<String, dynamic>>> _monthEntries = {};
  bool _isLoadingMonth = false;

  // Current entry
  Map<String, dynamic>? _currentEntry;
  bool _isLoadingEntry = false;
  bool _isSaving = false;
  String? _errorMessage;

  Map<String, List<Map<String, dynamic>>> get monthEntries => _monthEntries;
  bool get isLoadingMonth => _isLoadingMonth;
  Map<String, dynamic>? get currentEntry => _currentEntry;
  bool get isLoadingEntry => _isLoadingEntry;
  bool get isSaving => _isSaving;
  String? get errorMessage => _errorMessage;

  /// Check if a specific date has an entry
  bool hasEntryForDate(DateTime date) {
    final month = '${date.year}-${date.month.toString().padLeft(2, '0')}';
    final dateStr = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    final entries = _monthEntries[month];
    if (entries == null) return false;
    return entries.any((e) {
      final entryDate = e['entryDate'] ?? e['entry_date'] ?? '';
      return entryDate.toString().startsWith(dateStr);
    });
  }

  /// Get mood for a specific date
  String? getMoodForDate(DateTime date) {
    final month = '${date.year}-${date.month.toString().padLeft(2, '0')}';
    final dateStr = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    final entries = _monthEntries[month];
    if (entries == null) return null;
    final entry = entries.cast<Map<String, dynamic>?>().firstWhere(
      (e) {
        final entryDate = e?['entryDate'] ?? e?['entry_date'] ?? '';
        return entryDate.toString().startsWith(dateStr);
      },
      orElse: () => null,
    );
    return entry?['mood'];
  }

  /// Load entries for a month (lightweight, for calendar markers)
  Future<void> loadMonthEntries(DateTime month) async {
    final monthStr = '${month.year}-${month.month.toString().padLeft(2, '0')}';
    
    _isLoadingMonth = true;
    notifyListeners();

    try {
      final entries = await _diaryService.getMonthEntries(monthStr);
      _monthEntries[monthStr] = entries;
    } catch (e) {
      debugPrint('Error loading month entries: $e');
    }

    _isLoadingMonth = false;
    notifyListeners();
  }

  /// Load full decrypted entry for a date
  Future<void> loadEntryByDate(String date) async {
    _isLoadingEntry = true;
    _currentEntry = null;
    _errorMessage = null;
    notifyListeners();

    try {
      _currentEntry = await _diaryService.getEntryByDate(date);
    } catch (e) {
      _errorMessage = 'Failed to load entry';
      debugPrint('Error loading entry: $e');
    }

    _isLoadingEntry = false;
    notifyListeners();
  }

  /// Save (create or update) entry with offline queue fallback.
  /// Returns true if saved successfully (or queued), false on total failure.
  Future<bool> saveEntry({
    required String entryDate,
    required String content,
    String? title,
    String? mood,
  }) async {
    _isSaving = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Try direct save first
      final result = await _queueService.saveEntry(
        entryDate: entryDate,
        content: content,
        title: title,
        mood: mood,
      );

      if (result != null) {
        _currentEntry = result;
        // Refresh month entries in background
        final date = DateTime.parse(entryDate);
        loadMonthEntries(date); // fire-and-forget
      }

      _isSaving = false;
      notifyListeners();
      return true; // true even if queued — save will happen later
    } catch (e) {
      _errorMessage = 'Failed to save entry';
      _isSaving = false;
      notifyListeners();
      return false;
    }
  }

  /// Delete entry
  Future<bool> deleteEntry(String entryId, DateTime date) async {
    _isSaving = true;
    notifyListeners();

    try {
      await _diaryService.deleteEntry(entryId);
      _currentEntry = null;
      
      // Refresh month entries
      await loadMonthEntries(date);
      
      _isSaving = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Failed to delete entry';
      _isSaving = false;
      notifyListeners();
      return false;
    }
  }

  /// Upload images with offline queue fallback
  Future<List<Map<String, dynamic>>?> uploadImages({
    required String entryId,
    required List<File> images,
  }) async {
    try {
      return await _queueService.uploadImages(
        entryId: entryId,
        images: images,
      );
    } catch (e) {
      _errorMessage = 'Failed to upload images';
      notifyListeners();
      return null;
    }
  }

  /// Delete image
  Future<bool> deleteImage({
    required String entryId,
    required String imageId,
  }) async {
    try {
      await _diaryService.deleteImage(entryId: entryId, imageId: imageId);
      return true;
    } catch (e) {
      _errorMessage = 'Failed to delete image';
      notifyListeners();
      return false;
    }
  }

  void clearCurrentEntry() {
    _currentEntry = null;
    _errorMessage = null;
    notifyListeners();
  }
}
