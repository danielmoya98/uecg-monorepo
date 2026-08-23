import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/institution_model.dart';
import '../../data/repositories/institution_repository.dart';

final institutionRepositoryProvider = Provider<InstitutionRepository>((ref) {
  return InstitutionRepository();
});

final attendanceSettingsProvider =
    FutureProvider.autoDispose<AttendanceSettingsModel>((ref) async {
  final repository = ref.watch(institutionRepositoryProvider);
  return repository.getAttendanceSettings();
});

final campaignSettingsProvider =
    FutureProvider.autoDispose<CampaignSettingsModel>((ref) async {
  final repository = ref.watch(institutionRepositoryProvider);
  return repository.getCampaignSettings();
});
