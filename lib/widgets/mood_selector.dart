import 'package:flutter/material.dart';
import '../config/theme.dart';

class MoodData {
  final String emoji;
  final String label;
  final Color color;

  const MoodData({
    required this.emoji,
    required this.label,
    required this.color,
  });
}

const List<MoodData> moods = [
  MoodData(emoji: '😊', label: 'Happy', color: AppColors.moodHappy),
  MoodData(emoji: '😢', label: 'Sad', color: AppColors.moodSad),
  MoodData(emoji: '😡', label: 'Angry', color: AppColors.moodAngry),
  MoodData(emoji: '😌', label: 'Calm', color: AppColors.moodCalm),
  MoodData(emoji: '❤️', label: 'Love', color: AppColors.moodLove),
  MoodData(emoji: '🤩', label: 'Excited', color: AppColors.moodExcited),
  MoodData(emoji: '😴', label: 'Tired', color: Color(0xFF9E9E9E)),
  MoodData(emoji: '😰', label: 'Anxious', color: Color(0xFFCE93D8)),
];

class MoodSelector extends StatelessWidget {
  final String? selectedMood;
  final ValueChanged<String?> onMoodSelected;

  const MoodSelector({
    super.key,
    this.selectedMood,
    required this.onMoodSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 80,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        itemCount: moods.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final mood = moods[index];
          final isSelected = selectedMood == mood.label.toLowerCase();

          return GestureDetector(
            onTap: () {
              if (isSelected) {
                onMoodSelected(null);
              } else {
                onMoodSelected(mood.label.toLowerCase());
              }
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeOutCubic,
              width: 64,
              decoration: BoxDecoration(
                color: isSelected
                    ? mood.color.withValues(alpha: 0.2)
                    : AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected
                      ? mood.color.withValues(alpha: 0.6)
                      : AppColors.surfaceBorder,
                  width: isSelected ? 2 : 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: mood.color.withValues(alpha: 0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ]
                    : [],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  AnimatedScale(
                    scale: isSelected ? 1.2 : 1.0,
                    duration: const Duration(milliseconds: 200),
                    child: Text(
                      mood.emoji,
                      style: const TextStyle(fontSize: 28),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    mood.label,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight:
                          isSelected ? FontWeight.w600 : FontWeight.w400,
                      color: isSelected
                          ? mood.color
                          : AppColors.textHint,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
