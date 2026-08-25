class AttendanceDailyBlockModel {
  final String id;
  final String classroomId;
  final String grade;
  final String section;
  final String level;
  final String subjectName;
  final String teacherName;
  final String teacherAssignmentId;
  final String startTime;
  final String endTime;
  final List<String> classPeriodIds;
  final List<String> periodNames;

  const AttendanceDailyBlockModel({
    required this.id,
    required this.classroomId,
    required this.grade,
    required this.section,
    required this.level,
    required this.subjectName,
    required this.teacherName,
    required this.teacherAssignmentId,
    required this.startTime,
    required this.endTime,
    required this.classPeriodIds,
    required this.periodNames,
  });

  String get courseTitle => '$grade $section ($level)'.trim();
  String get timeRange => '$startTime - $endTime';
  String get firstClassPeriodId =>
      classPeriodIds.isNotEmpty ? classPeriodIds.first : '';

  factory AttendanceDailyBlockModel.fromJson(Map<String, dynamic> json) {
    final classroom = json['classroom'] as Map<String, dynamic>? ?? {};
    return AttendanceDailyBlockModel(
      id: json['id'] as String? ?? '',
      classroomId: json['classroomId'] as String? ?? '',
      grade: classroom['grade'] as String? ?? '',
      section: classroom['section'] as String? ?? '',
      level: classroom['level'] as String? ?? '',
      subjectName: json['subjectName'] as String? ?? 'Materia',
      teacherName: json['teacherName'] as String? ?? '',
      teacherAssignmentId: json['teacherAssignmentId'] as String? ?? '',
      startTime: json['startTime'] as String? ?? '',
      endTime: json['endTime'] as String? ?? '',
      classPeriodIds: (json['classPeriodIds'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      periodNames: (json['periodNames'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'classroomId': classroomId,
        'grade': grade,
        'section': section,
        'level': level,
        'subjectName': subjectName,
        'teacherName': teacherName,
        'teacherAssignmentId': teacherAssignmentId,
        'startTime': startTime,
        'endTime': endTime,
        'classPeriodIds': classPeriodIds,
        'periodNames': periodNames,
      };
}

class ClassroomStudentAttendanceModel {
  final String enrollmentId;
  final String studentId;
  final String fullName;
  final String? rude;
  String currentStatus; // 'PRESENT', 'LATE', 'ABSENT', 'EXCUSED', 'PENDING'
  final DateTime? timestamp;
  final String? method;

  ClassroomStudentAttendanceModel({
    required this.enrollmentId,
    required this.studentId,
    required this.fullName,
    this.rude,
    required this.currentStatus,
    this.timestamp,
    this.method,
  });

  factory ClassroomStudentAttendanceModel.fromJson(Map<String, dynamic> json) {
    final student = json['student'] as Map<String, dynamic>? ?? {};
    final record = json['record'] as Map<String, dynamic>?;

    final names = student['names'] as String? ?? '';
    final paterno = student['lastNamePaterno'] as String? ?? '';
    final materno = student['lastNameMaterno'] as String? ?? '';
    final fullName = '$paterno $materno $names'.trim();

    final status = record != null
        ? (record['status'] as String? ?? 'PRESENT')
        : 'PENDING';

    return ClassroomStudentAttendanceModel(
      enrollmentId: json['enrollmentId'] as String? ?? '',
      studentId: student['id'] as String? ?? '',
      fullName: fullName.isNotEmpty ? fullName : 'Sin Nombre',
      rude: student['rude'] as String?,
      currentStatus: status,
      timestamp: record != null && record['timestamp'] != null
          ? DateTime.tryParse(record['timestamp'].toString())
          : null,
      method: record?['method'] as String?,
    );
  }
}

class BulkAttendancePayload {
  final String classroomId;
  final List<String> classPeriodIds;
  final String date; // YYYY-MM-DD
  final List<Map<String, String>> records; // [{'enrollmentId': '...', 'status': '...'}]

  BulkAttendancePayload({
    required this.classroomId,
    required this.classPeriodIds,
    required this.date,
    required this.records,
  });

  Map<String, dynamic> toJson() => {
        'classroomId': classroomId,
        'classPeriodIds': classPeriodIds,
        'date': date,
        'records': records,
      };

  factory BulkAttendancePayload.fromJson(Map<String, dynamic> json) {
    return BulkAttendancePayload(
      classroomId: json['classroomId'] as String? ?? '',
      classPeriodIds: (json['classPeriodIds'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      date: json['date'] as String? ?? '',
      records: (json['records'] as List<dynamic>?)
              ?.map((e) => Map<String, String>.from(e as Map))
              .toList() ??
          [],
    );
  }
}
