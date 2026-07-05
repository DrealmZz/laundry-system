import React, { useState } from 'react';
import { Employee, ShiftBlock } from '../types';
import { Plus, X, Users, Calendar, Sparkles, HelpCircle } from 'lucide-react';
import { initialAvailableStaff } from '../initialData';

interface ShiftManagementProps {
  employees: Employee[];
  shiftBlocks: ShiftBlock[];
  onAddEmployeeToShift: (dayIndex: number, shiftIndex: number, employeeId: string) => void;
  onRemoveEmployeeFromShift: (dayIndex: number, shiftIndex: number, employeeId: string) => void;
}

export default function ShiftManagement({
  employees,
  shiftBlocks,
  onAddEmployeeToShift,
  onRemoveEmployeeFromShift
}: ShiftManagementProps) {
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const shifts = ['Pagi (08:00)', 'Siang (13:00)', 'Sore (17:00)', 'Malam (21:00)'];

  // State to manage the active "add staff" modal/dropdown
  const [activeCell, setActiveCell] = useState<{ dayIndex: number; shiftIndex: number } | null>(null);

  const getBlockAssignments = (dayIndex: number, shiftIndex: number): string[] => {
    const block = shiftBlocks.find(b => b.dayIndex === dayIndex && b.shiftIndex === shiftIndex);
    return block ? block.assignedEmployeeIds : [];
  };

  const handleCellClick = (dayIndex: number, shiftIndex: number) => {
    if (activeCell && activeCell.dayIndex === dayIndex && activeCell.shiftIndex === shiftIndex) {
      setActiveCell(null);
    } else {
      setActiveCell({ dayIndex, shiftIndex });
    }
  };

  const handleAddStaffToBlock = (employeeId: string) => {
    if (!activeCell) return;
    const { dayIndex, shiftIndex } = activeCell;
    const assigned = getBlockAssignments(dayIndex, shiftIndex);
    
    if (assigned.includes(employeeId)) {
      alert('Karyawan sudah ditugaskan pada shift ini!');
      return;
    }

    onAddEmployeeToShift(dayIndex, shiftIndex, employeeId);
    setActiveCell(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-ink tracking-tight">Manajemen Penjadwalan Shift</h2>
          <p className="text-xs text-ink-muted">Atur penjadwalan mingguan dan tugaskan karyawan ke shift harian</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Available Staff Sidebar */}
        <div className="lg:col-span-1 glass-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-ink">Daftar Karyawan</h3>
            <p className="text-xs text-ink-muted">Pilih staff untuk ditambahkan ke shift di tabel</p>
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/30 hover:border-teal/20 bg-white/15 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/30">
                  <img
                    src={employee.photoUrl}
                    alt={employee.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-ink truncate">{employee.name}</p>
                  <p className="text-[10px] text-ink-muted font-semibold">{employee.role}</p>
                </div>
                <span className={`w-2 h-2 rounded-full ${employee.status === 'Aktif' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              </div>
            ))}
          </div>

          <div className="border-t border-white/30 pt-3.5 space-y-2">
            <h4 className="text-[11px] font-bold text-ink-muted uppercase tracking-wider font-mono flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Cara Pengaturan:
            </h4>
            <ol className="text-[10px] text-ink-secondary space-y-1.5 list-decimal list-inside font-semibold leading-relaxed">
              <li>Klik tanda <span className="font-bold text-teal font-mono">+</span> di dalam kotak shift.</li>
              <li>Pilih karyawan dari daftar popover.</li>
              <li>Klik tanda <span className="font-bold text-red-500 font-mono">x</span> untuk menghapus penugasan.</li>
            </ol>
          </div>
        </div>

        {/* Right Column: Weekly Grid (Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Main Shift Table Grid */}
          <div className="glass-card p-5 overflow-x-auto">
            <div className="min-w-[800px] space-y-3">
              {/* Header: Days */}
              <div className="grid grid-cols-8 gap-3 text-center border-b border-white/10 pb-3">
                <div className="text-[11px] font-bold text-ink-muted text-left self-center uppercase font-mono tracking-wider">
                  Kategori Shift
                </div>
                {days.map((day, idx) => (
                  <div key={idx} className="bg-white/15 border border-white/30 py-1.5 rounded-xl">
                    <p className="text-xs font-black text-ink">{day}</p>
                  </div>
                ))}
              </div>

              {/* Rows: Shifts */}
              {shifts.map((shiftName, shiftIdx) => (
                <div key={shiftIdx} className="grid grid-cols-8 gap-3 min-h-[100px]">
                  {/* Left row title */}
                  <div className="flex flex-col justify-center bg-teal/10 border border-teal/20 p-2 rounded-xl">
                    <p className="text-xs font-extrabold text-ink leading-tight">{shiftName.split(' ')[0]}</p>
                    <p className="text-[9px] font-mono text-ink-muted font-bold">{shiftName.split(' ')[1]}</p>
                  </div>

                  {/* Day cells */}
                  {days.map((_, dayIdx) => {
                    const assignedIds = getBlockAssignments(dayIdx, shiftIdx);
                    const isCellOpen = activeCell?.dayIndex === dayIdx && activeCell?.shiftIndex === shiftIdx;

                    return (
                      <div
                        key={dayIdx}
                        className={`border rounded-xl p-2 flex flex-col justify-between transition-all relative ${
                          isCellOpen
                            ? 'border-teal/40 ring-2 ring-teal/20 bg-teal/10'
                            : 'border-white/30 hover:border-white/30 bg-white/15 shadow-sm'
                        }`}
                      >
                        {/* Assigned staff elements */}
                        <div className="space-y-1">
                          {assignedIds.map((empId) => {
                            const emp = employees.find(e => e.id === empId);
                            if (!emp) return null;
                            return (
                              <div
                                key={empId}
                                className="flex items-center justify-between bg-white/15 px-1.5 py-1 rounded-lg border border-white/30 text-[10px] font-semibold"
                              >
                                <span className="truncate max-w-[55px]" title={emp.name}>
                                  {emp.name.split(' ')[0]}
                                </span>
                                <button
                                  onClick={() => onRemoveEmployeeFromShift(dayIdx, shiftIdx, empId)}
                                  className="text-ink-muted/50 hover:text-red-500 rounded p-0.5"
                                  title="Hapus"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* Add button / Popover trigger */}
                        <div className="mt-2 text-right">
                          <button
                            onClick={() => handleCellClick(dayIdx, shiftIdx)}
                            className="p-1 rounded-lg hover:bg-white/20 border border-dashed border-white/30 hover:border-white/50 text-ink-muted hover:text-ink transition-all inline-flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Assign Popover Dropdown */}
                        {isCellOpen && (
                          <div className="absolute z-30 top-full left-0 right-0 mt-1 glass-card-elevated p-2 max-h-[140px] overflow-y-auto space-y-1">
                            <p className="text-[9px] font-black text-ink-muted uppercase tracking-wider mb-1 px-1">Tugaskan Staff:</p>
                            {employees.map((emp) => (
                              <button
                                key={emp.id}
                                onClick={() => handleAddStaffToBlock(emp.id)}
                                className="w-full text-left text-[10px] font-bold px-2 py-1.5 hover:bg-teal/10 hover:text-teal rounded-lg transition-colors flex items-center justify-between"
                              >
                                <span>{emp.name.split(' ')[0]} ({emp.role.split(' ')[0]})</span>
                                <span className="text-[8px] bg-white/25 px-1 rounded text-ink-muted">Add</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
