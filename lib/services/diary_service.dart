import 'dart:io';
import 'package:dio/dio.dart';
import 'api_service.dart';

class DiaryService {
  final _api = ApiService();

  /// Get lightweight entry list for a month (for calendar markers)
  Future<List<Map<String, dynamic>>> getMonthEntries(String month) async {
    final response = await _api.dio.get('/entries', queryParameters: {
      'month': month,
    });

    if (response.data['success'] == true) {
      return List<Map<String, dynamic>>.from(response.data['data']);
    }
    throw Exception('Failed to load entries');
  }

  /// Get full decrypted entry for a specific date
  Future<Map<String, dynamic>?> getEntryByDate(String date) async {
    try {
      final response = await _api.dio.get('/entries/$date');
      if (response.data['success'] == true) {
        return response.data['data'];
      }
      return null;
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      rethrow;
    }
  }

  /// Create or update a diary entry
  Future<Map<String, dynamic>> saveEntry({
    required String entryDate,
    required String content,
    String? title,
    String? mood,
  }) async {
    final response = await _api.dio.post('/entries', data: {
      'entry_date': entryDate,
      'content': content,
      if (title != null) 'title': title,
      if (mood != null) 'mood': mood,
    });

    if (response.data['success'] == true) {
      return response.data['data'];
    }
    throw Exception('Failed to save entry');
  }

  /// Update an existing entry
  Future<Map<String, dynamic>> updateEntry({
    required String entryId,
    String? content,
    String? title,
    String? mood,
  }) async {
    final response = await _api.dio.put('/entries/$entryId', data: {
      if (content != null) 'content': content,
      if (title != null) 'title': title,
      if (mood != null) 'mood': mood,
    });

    if (response.data['success'] == true) {
      return response.data['data'];
    }
    throw Exception('Failed to update entry');
  }

  /// Soft-delete an entry
  Future<void> deleteEntry(String entryId) async {
    await _api.dio.delete('/entries/$entryId');
  }

  /// Upload images to an entry
  Future<List<Map<String, dynamic>>> uploadImages({
    required String entryId,
    required List<File> images,
  }) async {
    final formData = FormData.fromMap({
      'images': images.map((file) {
        return MultipartFile.fromFileSync(
          file.path,
          filename: file.path.split('/').last,
        );
      }).toList(),
    });

    final response = await _api.dio.post(
      '/entries/$entryId/images',
      data: formData,
    );

    if (response.data['success'] == true) {
      return List<Map<String, dynamic>>.from(response.data['data']);
    }
    throw Exception('Failed to upload images');
  }

  /// Delete an image from an entry
  Future<void> deleteImage({
    required String entryId,
    required String imageId,
  }) async {
    await _api.dio.delete('/entries/$entryId/images/$imageId');
  }
}
