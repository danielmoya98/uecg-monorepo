class AttendanceSettingsModel {
  final bool enableQrAttendance;
  final bool enableBiometricAttendance;
  final int lateToleranceMinutes;
  final int absentToleranceMinutes;
  final String notificationFrequency;

  const AttendanceSettingsModel({
    required this.enableQrAttendance,
    required this.enableBiometricAttendance,
    required this.lateToleranceMinutes,
    required this.absentToleranceMinutes,
    required this.notificationFrequency,
  });

  factory AttendanceSettingsModel.fromJson(Map<String, dynamic> json) {
    return AttendanceSettingsModel(
      enableQrAttendance: json['enableQrAttendance'] as bool? ?? false,
      enableBiometricAttendance: json['enableBiometricAttendance'] as bool? ?? false,
      lateToleranceMinutes: (json['lateToleranceMinutes'] as num?)?.toInt() ?? 5,
      absentToleranceMinutes: (json['absentToleranceMinutes'] as num?)?.toInt() ?? 15,
      notificationFrequency: json['notificationFrequency'] as String? ?? 'ALERTS_ONLY',
    );
  }

  Map<String, dynamic> toJson() => {
        'enableQrAttendance': enableQrAttendance,
        'enableBiometricAttendance': enableBiometricAttendance,
        'lateToleranceMinutes': lateToleranceMinutes,
        'absentToleranceMinutes': absentToleranceMinutes,
        'notificationFrequency': notificationFrequency,
      };
}

class CampaignSettingsModel {
  final bool enableDigitalRudeUpdates;
  final int maxRudeUpdatesPerYear;
  final List<String> activeNotificationChannels;

  const CampaignSettingsModel({
    required this.enableDigitalRudeUpdates,
    required this.maxRudeUpdatesPerYear,
    required this.activeNotificationChannels,
  });

  factory CampaignSettingsModel.fromJson(Map<String, dynamic> json) {
    return CampaignSettingsModel(
      enableDigitalRudeUpdates: json['enableDigitalRudeUpdates'] as bool? ?? false,
      maxRudeUpdatesPerYear: (json['maxRudeUpdatesPerYear'] as num?)?.toInt() ?? 2,
      activeNotificationChannels: (json['activeNotificationChannels'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          ['PUSH_APP'],
    );
  }

  Map<String, dynamic> toJson() => {
        'enableDigitalRudeUpdates': enableDigitalRudeUpdates,
        'maxRudeUpdatesPerYear': maxRudeUpdatesPerYear,
        'activeNotificationChannels': activeNotificationChannels,
      };
}

class QRAttendanceResultModel {
  final String status;
  final String studentName;
  final String rudeCode;
  final String message;
  final DateTime timestamp;

  const QRAttendanceResultModel({
    required this.status,
    required this.studentName,
    required this.rudeCode,
    required this.message,
    required this.timestamp,
  });

  factory QRAttendanceResultModel.fromJson(Map<String, dynamic> json) {
    return QRAttendanceResultModel(
      status: json['status'] as String? ?? 'PUNTUAL',
      studentName: json['studentName'] as String? ?? (json['data']?['studentName'] as String? ?? 'Estudiante'),
      rudeCode: json['rudeCode'] as String? ?? '',
      message: json['message'] as String? ?? 'Asistencia registrada',
      timestamp: DateTime.now(),
    );
  }
}
