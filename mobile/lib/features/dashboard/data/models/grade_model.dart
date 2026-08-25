class TrimesterInfo {
  final String id;
  final String name;
  final int order;
  final bool isOpen;

  const TrimesterInfo({
    required this.id,
    required this.name,
    required this.order,
    required this.isOpen,
  });

  String get displayName {
    switch (name) {
      case 'PRIMER_TRIMESTRE':
        return '1er Trimestre';
      case 'SEGUNDO_TRIMESTRE':
        return '2do Trimestre';
      case 'TERCER_TRIMESTRE':
        return '3er Trimestre';
      default:
        return name.replaceAll('_', ' ');
    }
  }

  String get statusLabel {
    if (isOpen) return 'ABIERTO';
    return 'CERRADO';
  }

  factory TrimesterInfo.fromJson(Map<String, dynamic> json) {
    return TrimesterInfo(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      order: json['order'] as int? ?? 1,
      isOpen: json['isOpen'] as bool? ?? false,
    );
  }
}

class TrimesterScore {
  final int? scoreSer;
  final int? scoreSaber;
  final int? scoreHacer;
  final int? scoreAuto;
  final int? totalScore;
  final int? recoveryScore;
  final int? finalScore;

  const TrimesterScore({
    this.scoreSer,
    this.scoreSaber,
    this.scoreHacer,
    this.scoreAuto,
    this.totalScore,
    this.recoveryScore,
    this.finalScore,
  });

  bool get hasScores =>
      scoreSer != null || scoreSaber != null || scoreHacer != null || scoreAuto != null;

  factory TrimesterScore.fromJson(Map<String, dynamic> json) {
    return TrimesterScore(
      scoreSer: json['scoreSer'] as int?,
      scoreSaber: json['scoreSaber'] as int?,
      scoreHacer: json['scoreHacer'] as int?,
      scoreAuto: json['scoreAuto'] as int?,
      totalScore: json['totalScore'] as int?,
      recoveryScore: json['recoveryScore'] as int?,
      finalScore: json['finalScore'] as int?,
    );
  }
}

class SubjectGradesModel {
  final String assignmentId;
  final String subjectId;
  final String subjectName;
  final String? area;
  final String teacherName;
  final Map<String, TrimesterScore> trimesterGrades;

  const SubjectGradesModel({
    required this.assignmentId,
    required this.subjectId,
    required this.subjectName,
    this.area,
    required this.teacherName,
    required this.trimesterGrades,
  });

  factory SubjectGradesModel.fromJson(Map<String, dynamic> json) {
    final rawGrades = json['trimesterGrades'] as Map<String, dynamic>? ?? {};
    final Map<String, TrimesterScore> mapped = {};

    rawGrades.forEach((trimesterId, val) {
      if (val is Map<String, dynamic>) {
        mapped[trimesterId] = TrimesterScore.fromJson(val);
      }
    });

    return SubjectGradesModel(
      assignmentId: json['assignmentId'] as String? ?? '',
      subjectId: json['subjectId'] as String? ?? '',
      subjectName: json['subjectName'] as String? ?? 'Materia',
      area: json['area'] as String?,
      teacherName: json['teacherName'] as String? ?? 'Profesor',
      trimesterGrades: mapped,
    );
  }
}

class GradesReportModel {
  final String academicYearName;
  final String studentFullName;
  final String classroomLabel;
  final List<TrimesterInfo> trimesters;
  final List<SubjectGradesModel> subjects;

  const GradesReportModel({
    required this.academicYearName,
    required this.studentFullName,
    required this.classroomLabel,
    required this.trimesters,
    required this.subjects,
  });

  factory GradesReportModel.fromJson(Map<String, dynamic> json) {
    final year = json['academicYear'] as Map<String, dynamic>? ?? {};
    final student = json['student'] as Map<String, dynamic>? ?? {};
    final classroom = json['classroom'] as Map<String, dynamic>? ?? {};

    final rawTrimesters = json['trimesters'] as List<dynamic>? ?? [];
    final trimesters = rawTrimesters
        .map((t) => TrimesterInfo.fromJson(t as Map<String, dynamic>))
        .toList();

    final rawSubjects = json['subjects'] as List<dynamic>? ?? [];
    final subjects = rawSubjects
        .map((s) => SubjectGradesModel.fromJson(s as Map<String, dynamic>))
        .toList();

    final studentFullName =
        '${student['lastNamePaterno'] ?? ''} ${student['lastNameMaterno'] ?? ''} ${student['names'] ?? ''}'
            .trim();

    final classroomLabel =
        '${classroom['grade'] ?? ''} "${classroom['section'] ?? ''}" - ${classroom['level'] ?? ''}';

    return GradesReportModel(
      academicYearName: year['name'] as String? ?? '',
      studentFullName: studentFullName.isNotEmpty ? studentFullName : 'Estudiante',
      classroomLabel: classroomLabel,
      trimesters: trimesters,
      subjects: subjects,
    );
  }
}
