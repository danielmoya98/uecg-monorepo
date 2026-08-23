class TeacherCourseModel {
  final String id;
  final String grade;
  final String section;
  final String level;
  final String shift;
  final String? subjectName;
  final String? subjectArea;
  final int enrolledCount;
  final int capacity;
  final String? baseRoomName;

  const TeacherCourseModel({
    required this.id,
    required this.grade,
    required this.section,
    required this.level,
    required this.shift,
    this.subjectName,
    this.subjectArea,
    this.enrolledCount = 0,
    this.capacity = 35,
    this.baseRoomName,
  });

  String get displayName {
    if (subjectName != null && subjectName!.isNotEmpty) {
      return '$subjectName - $grade "$section"'.toUpperCase();
    }
    return '$grade "$section" ($level)'.toUpperCase();
  }

  factory TeacherCourseModel.fromJson(Map<String, dynamic> json) {
    // Si viene desde /teacher-assignments
    if (json.containsKey('classroom') && json.containsKey('subject')) {
      final classroom = json['classroom'] as Map<String, dynamic>? ?? {};
      final subject = json['subject'] as Map<String, dynamic>? ?? {};
      final countObj = classroom['_count'] as Map<String, dynamic>? ?? {};

      return TeacherCourseModel(
        id: json['id'] as String? ?? classroom['id'] as String? ?? '',
        grade: classroom['grade'] as String? ?? '',
        section: classroom['section'] as String? ?? '',
        level: classroom['level'] as String? ?? '',
        shift: classroom['shift'] as String? ?? '',
        subjectName: subject['name'] as String?,
        subjectArea: subject['area'] as String?,
        enrolledCount: countObj['enrollments'] as int? ?? 0,
        capacity: classroom['capacity'] as int? ?? 35,
        baseRoomName: classroom['baseRoom']?['name'] as String?,
      );
    }

    // Si viene directamente de /classrooms
    final countObj = json['_count'] as Map<String, dynamic>? ?? {};
    return TeacherCourseModel(
      id: json['id'] as String? ?? '',
      grade: json['grade'] as String? ?? '',
      section: json['section'] as String? ?? '',
      level: json['level'] as String? ?? '',
      shift: json['shift'] as String? ?? '',
      enrolledCount: countObj['enrollments'] as int? ?? 0,
      capacity: json['capacity'] as int? ?? 35,
      baseRoomName: json['baseRoom']?['name'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'grade': grade,
      'section': section,
      'level': level,
      'shift': shift,
      'subjectName': subjectName,
      'subjectArea': subjectArea,
      'enrolledCount': enrolledCount,
      'capacity': capacity,
      'baseRoomName': baseRoomName,
    };
  }
}
