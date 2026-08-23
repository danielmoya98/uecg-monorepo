class ScheduleSlotModel {
  final String id;
  final int dayOfWeek;
  final String startTime;
  final String endTime;
  final String subjectName;
  final String? teacherName;
  final String? classroomGrade;
  final String? classroomSection;
  final String? physicalSpaceName;
  final bool isBreak;

  const ScheduleSlotModel({
    required this.id,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    required this.subjectName,
    this.teacherName,
    this.classroomGrade,
    this.classroomSection,
    this.physicalSpaceName,
    this.isBreak = false,
  });

  String get timeRange => '$startTime - $endTime';

  String get locationName => physicalSpaceName ?? 'Aula no asignada';

  factory ScheduleSlotModel.fromJson(Map<String, dynamic> json) {
    final period = json['classPeriod'] as Map<String, dynamic>? ?? {};
    final assignment = json['teacherAssignment'] as Map<String, dynamic>? ?? {};
    final subject = assignment['subject'] as Map<String, dynamic>? ?? {};
    final teacher = assignment['teacher'] as Map<String, dynamic>? ?? json['teacher'] as Map<String, dynamic>? ?? {};
    final classroom = json['classroom'] as Map<String, dynamic>? ?? assignment['classroom'] as Map<String, dynamic>? ?? {};
    final space = json['physicalSpace'] as Map<String, dynamic>?;

    return ScheduleSlotModel(
      id: json['id'] as String? ?? '',
      dayOfWeek: json['dayOfWeek'] as int? ?? 1,
      startTime: period['startTime'] as String? ?? json['startTime'] as String? ?? '',
      endTime: period['endTime'] as String? ?? json['endTime'] as String? ?? '',
      subjectName: subject['name'] as String? ?? json['subjectName'] as String? ?? 'Clase',
      teacherName: teacher['fullName'] as String? ?? json['teacherName'] as String?,
      classroomGrade: classroom['grade'] as String? ?? json['classroomGrade'] as String?,
      classroomSection: classroom['section'] as String? ?? json['classroomSection'] as String?,
      physicalSpaceName: space?['name'] as String? ?? json['physicalSpaceName'] as String?,
      isBreak: period['isBreak'] as bool? ?? json['isBreak'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'dayOfWeek': dayOfWeek,
      'startTime': startTime,
      'endTime': endTime,
      'subjectName': subjectName,
      'teacherName': teacherName,
      'classroomGrade': classroomGrade,
      'classroomSection': classroomSection,
      'physicalSpaceName': physicalSpaceName,
      'isBreak': isBreak,
    };
  }
}
