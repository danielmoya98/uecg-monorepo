import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uecg_app/features/timetables/data/repositories/timetables_repository.dart';
import 'package:uecg_app/features/dashboard/data/models/schedule_slot_model.dart';

final timetablesRepositoryProvider = Provider<TimetablesRepository>((ref) {
  return TimetablesRepository();
});

/// Estado del horario semanal completo
class MyScheduleNotifier extends StateNotifier<AsyncValue<List<ScheduleSlotModel>>> {
  final TimetablesRepository _repository;

  MyScheduleNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadSchedule();
  }

  Future<void> loadSchedule() async {
    state = const AsyncValue.loading();
    try {
      final slots = await _repository.getMySchedule();
      state = AsyncValue.data(slots);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> refresh() async {
    try {
      final slots = await _repository.getMySchedule();
      state = AsyncValue.data(slots);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
}

final myScheduleProvider =
    StateNotifierProvider<MyScheduleNotifier, AsyncValue<List<ScheduleSlotModel>>>((ref) {
  final repository = ref.watch(timetablesRepositoryProvider);
  return MyScheduleNotifier(repository);
});

/// Estado del horario de hoy (para los dashboards)
class TodayScheduleNotifier extends StateNotifier<AsyncValue<List<ScheduleSlotModel>>> {
  final TimetablesRepository _repository;

  TodayScheduleNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadTodaySchedule();
  }

  Future<void> loadTodaySchedule() async {
    state = const AsyncValue.loading();
    try {
      final slots = await _repository.getTodaySchedule();
      state = AsyncValue.data(slots);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> refresh() async {
    try {
      final slots = await _repository.getTodaySchedule();
      state = AsyncValue.data(slots);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
}

final todayScheduleProvider =
    StateNotifierProvider<TodayScheduleNotifier, AsyncValue<List<ScheduleSlotModel>>>((ref) {
  final repository = ref.watch(timetablesRepositoryProvider);
  return TodayScheduleNotifier(repository);
});

/// Día seleccionado para la vista semanal (1=LUN, 2=MAR, ..., 5=VIE, 6=SAB)
final selectedScheduleDayProvider = StateProvider<int>((ref) {
  final weekday = DateTime.now().weekday;
  // Si es domingo (7), seleccionar Lunes (1) por defecto
  return (weekday >= 1 && weekday <= 6) ? weekday : 1;
});

/// Filtro de slots para el día seleccionado
final filteredDayScheduleProvider = Provider<List<ScheduleSlotModel>>((ref) {
  final selectedDay = ref.watch(selectedScheduleDayProvider);
  final scheduleState = ref.watch(myScheduleProvider);

  return scheduleState.when(
    data: (slots) => slots.where((s) => s.dayOfWeek == selectedDay).toList(),
    loading: () => [],
    error: (_, __) => [],
  );
});
