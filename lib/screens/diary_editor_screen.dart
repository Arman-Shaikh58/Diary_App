import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:flutter_quill/flutter_quill.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../config/theme.dart';
import '../providers/diary_provider.dart';
import '../widgets/mood_selector.dart';
import '../widgets/image_strip.dart';

class DiaryEditorScreen extends StatefulWidget {
  final String date;

  const DiaryEditorScreen({super.key, required this.date});

  @override
  State<DiaryEditorScreen> createState() => _DiaryEditorScreenState();
}

class _DiaryEditorScreenState extends State<DiaryEditorScreen>
    with SingleTickerProviderStateMixin {
  late QuillController _quillController;
  final TextEditingController _titleController = TextEditingController();
  final FocusNode _editorFocusNode = FocusNode();
  final ScrollController _editorScrollController = ScrollController();
  String? _selectedMood;
  String? _entryId;
  List<Map<String, dynamic>> _images = [];
  bool _hasUnsavedChanges = false;
  bool _isInitialLoad = true;
  late AnimationController _animController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _quillController = QuillController.basic();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOut),
    );

    _quillController.document.changes.listen((_) {
      if (!_isInitialLoad) {
        _hasUnsavedChanges = true;
      }
    });

    _titleController.addListener(() {
      if (!_isInitialLoad) {
        _hasUnsavedChanges = true;
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadEntry();
    });
  }

  Future<void> _loadEntry() async {
    final diaryProvider = context.read<DiaryProvider>();
    await diaryProvider.loadEntryByDate(widget.date);

    final entry = diaryProvider.currentEntry;
    if (entry != null) {
      _entryId = entry['id'];
      _titleController.text = entry['title'] ?? '';
      _selectedMood = entry['mood'];

      // Load quill content
      final content = entry['content'];
      if (content != null && content.toString().isNotEmpty) {
        try {
          final delta = Document.fromJson(jsonDecode(content));
          _quillController = QuillController(
            document: delta,
            selection: const TextSelection.collapsed(offset: 0),
          );
          _quillController.document.changes.listen((_) {
            if (!_isInitialLoad) {
              _hasUnsavedChanges = true;
            }
          });
        } catch (_) {
          // If content is plain text, set it directly
          _quillController = QuillController(
            document: Document()..insert(0, content.toString()),
            selection: const TextSelection.collapsed(offset: 0),
          );
        }
      }

      // Load images
      _images = List<Map<String, dynamic>>.from(entry['images'] ?? []);
    }

    _isInitialLoad = false;
    _animController.forward();
    if (mounted) setState(() {});
  }

  Future<void> _saveEntry() async {
    final diaryProvider = context.read<DiaryProvider>();
    final content = jsonEncode(_quillController.document.toDelta().toJson());

    final success = await diaryProvider.saveEntry(
      entryDate: widget.date,
      content: content,
      title: _titleController.text.isNotEmpty ? _titleController.text : null,
      mood: _selectedMood,
    );

    if (success && mounted) {
      _entryId = diaryProvider.currentEntry?['id'];
      _hasUnsavedChanges = false;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: AppColors.success, size: 18),
              const SizedBox(width: 8),
              const Text('Entry saved successfully'),
            ],
          ),
          backgroundColor: AppColors.surface,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _deleteEntry() async {
    if (_entryId == null) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Delete Entry',
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        content: const Text(
          'This action cannot be undone. Are you sure?',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textHint)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final diaryProvider = context.read<DiaryProvider>();
      final success = await diaryProvider.deleteEntry(
        _entryId!,
        DateTime.parse(widget.date),
      );
      if (success && mounted) {
        Navigator.of(context).pop();
      }
    }
  }

  Future<void> _pickImages() async {
    if (_entryId == null) {
      // Save entry first
      await _saveEntry();
      if (_entryId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Please save the entry before adding images'),
            backgroundColor: AppColors.surface,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        return;
      }
    }

    final picker = ImagePicker();
    final pickedFiles = await picker.pickMultiImage(
      maxWidth: 1920,
      maxHeight: 1920,
      imageQuality: 85,
    );

    if (pickedFiles.isNotEmpty && mounted) {
      final files = pickedFiles.map((xf) => File(xf.path)).toList();
      final diaryProvider = context.read<DiaryProvider>();
      final uploaded = await diaryProvider.uploadImages(
        entryId: _entryId!,
        images: files,
      );

      if (uploaded != null) {
        setState(() {
          _images.addAll(uploaded);
        });
      }
    }
  }

  void _viewImage(int index) {
    Navigator.of(context).pushNamed(
      '/image-viewer',
      arguments: {
        'images': _images,
        'initialIndex': index,
      },
    );
  }

  Future<void> _deleteImage(String imageId) async {
    if (_entryId == null) return;

    final diaryProvider = context.read<DiaryProvider>();
    final success = await diaryProvider.deleteImage(
      entryId: _entryId!,
      imageId: imageId,
    );

    if (success) {
      setState(() {
        _images.removeWhere((img) => img['id'] == imageId);
      });
    }
  }

  Future<bool> _onWillPop() async {
    if (!_hasUnsavedChanges) return true;

    final result = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Unsaved Changes',
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        content: const Text(
          'You have unsaved changes. What would you like to do?',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, 'cancel'),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textHint)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, 'discard'),
            child: const Text('Discard', style: TextStyle(color: AppColors.error)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, 'save'),
            child: const Text('Save', style: TextStyle(color: AppColors.accent)),
          ),
        ],
      ),
    );

    if (result == 'save') {
      await _saveEntry();
      return true;
    }
    return result == 'discard';
  }

  @override
  void dispose() {
    _animController.dispose();
    _quillController.dispose();
    _titleController.dispose();
    _editorFocusNode.dispose();
    _editorScrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final diaryProvider = context.watch<DiaryProvider>();
    final parsedDate = DateTime.parse(widget.date);
    final formattedDate = DateFormat('EEEE, d MMMM yyyy').format(parsedDate);

    return PopScope(
      canPop: !_hasUnsavedChanges,
      onPopInvokedWithResult: (didPop, result) async {
        if (!didPop) {
          final shouldPop = await _onWillPop();
          if (shouldPop && mounted) {
            Navigator.of(context).pop();
          }
        }
      },
      child: Scaffold(
        body: Container(
          width: double.infinity,
          height: double.infinity,
          decoration: const BoxDecoration(
            gradient: AppColors.backgroundGradient,
          ),
          child: SafeArea(
            child: Column(
              children: [
                // AppBar
                Padding(
                  padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () async {
                          if (_hasUnsavedChanges) {
                            final shouldPop = await _onWillPop();
                            if (shouldPop && mounted) {
                              Navigator.of(context).pop();
                            }
                          } else {
                            Navigator.of(context).pop();
                          }
                        },
                        icon: const Icon(Icons.arrow_back_ios_new_rounded,
                            color: AppColors.textPrimary, size: 20),
                      ),
                      Expanded(
                        child: Text(
                          formattedDate,
                          textAlign: TextAlign.center,
                          style: GoogleFonts.outfit(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                      if (_entryId != null)
                        IconButton(
                          onPressed: _deleteEntry,
                          icon: Icon(Icons.delete_outline_rounded,
                              color: AppColors.error.withValues(alpha: 0.8), size: 22),
                        )
                      else
                        const SizedBox(width: 48),
                    ],
                  ),
                ),

                // Content
                Expanded(
                  child: diaryProvider.isLoadingEntry
                      ? const Center(
                          child: CircularProgressIndicator(
                            color: AppColors.primary,
                            strokeWidth: 2.5,
                          ),
                        )
                      : FadeTransition(
                          opacity: _fadeAnimation,
                          child: SingleChildScrollView(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 12),

                                // Title
                                TextField(
                                  controller: _titleController,
                                  style: GoogleFonts.outfit(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary,
                                  ),
                                  decoration: InputDecoration(
                                    hintText: 'Entry Title (optional)',
                                    hintStyle: GoogleFonts.outfit(
                                      fontSize: 24,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.textHint.withValues(alpha: 0.4),
                                    ),
                                    border: InputBorder.none,
                                    enabledBorder: InputBorder.none,
                                    focusedBorder: InputBorder.none,
                                    contentPadding: const EdgeInsets.symmetric(
                                        horizontal: 4, vertical: 8),
                                    filled: false,
                                  ),
                                  maxLength: 255,
                                  buildCounter: (_, {required currentLength, required isFocused, maxLength}) => null,
                                ),

                                const SizedBox(height: 8),

                                // Mood selector
                                Padding(
                                  padding: const EdgeInsets.only(left: 4, bottom: 4),
                                  child: Text(
                                    'How are you feeling?',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: AppColors.textHint,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                                MoodSelector(
                                  selectedMood: _selectedMood,
                                  onMoodSelected: (mood) {
                                    setState(() {
                                      _selectedMood = mood;
                                      _hasUnsavedChanges = true;
                                    });
                                  },
                                ),

                                const SizedBox(height: 16),

                                // Divider
                                Container(
                                  height: 1,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        Colors.transparent,
                                        AppColors.surfaceBorder,
                                        Colors.transparent,
                                      ],
                                    ),
                                  ),
                                ),

                                const SizedBox(height: 12),

                                // Image strip
                                if (_images.isNotEmpty || _entryId != null)
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 12),
                                    child: ImageStrip(
                                      images: _images,
                                      onAddImage: _pickImages,
                                      onImageTap: _viewImage,
                                      onImageDelete: _deleteImage,
                                    ),
                                  ),

                                // Quill editor
                                Container(
                                  constraints: BoxConstraints(
                                    minHeight: MediaQuery.of(context).size.height * 0.4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.surface.withValues(alpha: 0.3),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: AppColors.surfaceBorder.withValues(alpha: 0.3),
                                    ),
                                  ),
                                  padding: const EdgeInsets.all(12),
                                  child: QuillEditor(
                                    controller: _quillController,
                                    focusNode: _editorFocusNode,
                                    scrollController: _editorScrollController,
                                    config: QuillEditorConfig(
                                      placeholder: 'Write your thoughts...',
                                      padding: const EdgeInsets.all(4),
                                      customStyles: DefaultStyles(
                                        paragraph: DefaultTextBlockStyle(
                                          TextStyle(
                                            fontSize: 16,
                                            color: AppColors.textPrimary,
                                            height: 1.6,
                                          ),
                                          const HorizontalSpacing(0, 0),
                                          const VerticalSpacing(4, 4),
                                          const VerticalSpacing(0, 0),
                                          null,
                                        ),
                                        placeHolder: DefaultTextBlockStyle(
                                          TextStyle(
                                            fontSize: 16,
                                            color: AppColors.textHint.withValues(alpha: 0.5),
                                            height: 1.6,
                                          ),
                                          const HorizontalSpacing(0, 0),
                                          const VerticalSpacing(4, 4),
                                          const VerticalSpacing(0, 0),
                                          null,
                                        ),
                                        h1: DefaultTextBlockStyle(
                                          GoogleFonts.outfit(
                                            fontSize: 28,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.textPrimary,
                                          ),
                                          const HorizontalSpacing(0, 0),
                                          const VerticalSpacing(8, 8),
                                          const VerticalSpacing(0, 0),
                                          null,
                                        ),
                                        h2: DefaultTextBlockStyle(
                                          GoogleFonts.outfit(
                                            fontSize: 22,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.textPrimary,
                                          ),
                                          const HorizontalSpacing(0, 0),
                                          const VerticalSpacing(6, 6),
                                          const VerticalSpacing(0, 0),
                                          null,
                                        ),
                                        bold: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.textPrimary,
                                        ),
                                        italic: const TextStyle(
                                          fontStyle: FontStyle.italic,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),

                                const SizedBox(height: 100),
                              ],
                            ),
                          ),
                        ),
                ),

                // Quill Toolbar
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    border: Border(
                      top: BorderSide(
                        color: AppColors.surfaceBorder.withValues(alpha: 0.5),
                      ),
                    ),
                  ),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: QuillSimpleToolbar(
                      controller: _quillController,
                      config: QuillSimpleToolbarConfig(
                        showAlignmentButtons: true,
                        showBoldButton: true,
                        showItalicButton: true,
                        showUnderLineButton: true,
                        showStrikeThrough: true,
                        showListBullets: true,
                        showListNumbers: true,
                        showHeaderStyle: true,
                        showFontFamily: false,
                        showFontSize: false,
                        showInlineCode: false,
                        showCodeBlock: false,
                        showQuote: true,
                        showIndent: false,
                        showLink: false,
                        showSearchButton: false,
                        showSubscript: false,
                        showSuperscript: false,
                        showClipboardCut: false,
                        showClipboardCopy: false,
                        showClipboardPaste: false,
                        showDirection: false,
                        showBackgroundColorButton: true,
                        showColorButton: true,
                        showUndo: true,
                        showRedo: true,
                        showDividers: true,
                        multiRowsDisplay: false,
                        buttonOptions: QuillSimpleToolbarButtonOptions(
                          base: QuillToolbarBaseButtonOptions(
                            iconTheme: QuillIconTheme(
                              iconButtonSelectedData: IconButtonData(
                                color: AppColors.accent,
                                style: IconButton.styleFrom(
                                  backgroundColor: AppColors.primary.withValues(alpha: 0.2),
                                ),
                              ),
                              iconButtonUnselectedData: IconButtonData(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: diaryProvider.isSaving ? null : _saveEntry,
          backgroundColor: AppColors.primary,
          elevation: 8,
          child: diaryProvider.isSaving
              ? const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2.5,
                  ),
                )
              : const Icon(Icons.save_rounded, color: Colors.white),
        ),
      ),
    );
  }
}
