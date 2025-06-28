import express from 'express';
import LiveSession from '../models/LiveSession.js';
import Pertemuan from '../models/Pertemuan.js';
import SessionRecord from '../models/SessionRecord.js';
import { auth } from '../middleware/auth.js';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

const router = express.Router();

// Export live session to Excel
router.get('/excel/session/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await LiveSession.findOne({ sessionId })
      .populate('mata_kuliah_id', 'nama kode')
      .populate('dosen_id', 'nama_lengkap');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Prepare data for Excel
    const excelData = session.detectionData.map((data, index) => ({
      'Time': data.timestamp.toLocaleString(),
      'Total Detections': data.totalDetections,
      'Focused Count': data.focusedCount,
      'Not Focused Count': data.notFocusedCount,
      'Sleeping Count': data.sleepingCount,
      'Phone Using Count': data.phoneUsingCount,
      'Chatting Count': data.chattingCount,
      'Focus Percentage': data.focusPercentage + '%'
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Add session info sheet
    const sessionInfo = [
      ['Session ID', session.sessionId],
      ['Class', session.kelas],
      ['Subject', session.mata_kuliah],
      ['Instructor', session.dosen_id.nama_lengkap],
      ['Start Time', session.startTime.toLocaleString()],
      ['End Time', session.endTime ? session.endTime.toLocaleString() : 'Ongoing'],
      ['Average Focus', session.summary.averageFocus.toFixed(2) + '%'],
      ['Peak Focus', session.summary.peakFocus.toFixed(2) + '%'],
      ['Lowest Focus', session.summary.lowestFocus.toFixed(2) + '%']
    ];
    
    const wsInfo = XLSX.utils.aoa_to_sheet(sessionInfo);
    
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Session Info');
    XLSX.utils.book_append_sheet(wb, ws, 'Detection Data');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename="focus-session-${sessionId}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export meeting report to PDF
router.get('/pdf/meeting/:meetingId', auth, async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const meeting = await Pertemuan.findById(meetingId)
      .populate('mata_kuliah_id', 'nama kode')
      .populate('dosen_id', 'nama_lengkap departemen');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Create PDF
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="meeting-report-${meetingId}.pdf"`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Focus Monitoring Report', { align: 'center' });
    doc.moveDown();

    // Meeting Info
    doc.fontSize(14).text('Meeting Information', { underline: true });
    doc.fontSize(12)
       .text(`Subject: ${meeting.mata_kuliah}`)
       .text(`Class: ${meeting.kelas}`)
       .text(`Meeting: ${meeting.pertemuan_ke}`)
       .text(`Date: ${meeting.tanggal.toLocaleDateString()}`)
       .text(`Instructor: ${meeting.dosen_id.nama_lengkap}`)
       .text(`Duration: ${meeting.durasi_pertemuan} minutes`);
    
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('Focus Summary', { underline: true });
    doc.fontSize(12)
       .text(`Overall Focus Rate: ${meeting.hasil_akhir_kelas.fokus.toFixed(2)}%`)
       .text(`Students Present: ${meeting.hasil_akhir_kelas.jumlah_hadir}`)
       .text(`Average Focus Duration: ${Math.round(meeting.data_fokus.reduce((sum, s) => sum + s.durasi_fokus, 0) / meeting.data_fokus.length)} minutes`);

    doc.moveDown();

    // Student Details
    doc.fontSize(14).text('Student Focus Details', { underline: true });
    doc.fontSize(10);
    
    meeting.data_fokus.forEach((student, index) => {
      if (index % 20 === 0 && index > 0) {
        doc.addPage();
      }
      doc.text(`${student.id_siswa}: ${student.persen_fokus}% (${student.status})`);
    });

    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export session record to PDF
router.get('/pdf/session/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await SessionRecord.findById(sessionId)
      .populate('dosen_id', 'nama_lengkap departemen');

    if (!session) {
      return res.status(404).json({ message: 'Session record not found' });
    }

    // Create PDF
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="session-report-${sessionId}.pdf"`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Live Monitoring Session Report', { align: 'center' });
    doc.moveDown();

    // Session Info
    doc.fontSize(14).text('Session Information', { underline: true });
    doc.fontSize(12)
       .text(`Session Name: ${session.sessionName}`)
       .text(`Class: ${session.kelas}`)
       .text(`Subject: ${session.mata_kuliah}`)
       .text(`Date: ${session.tanggal.toLocaleDateString()}`)
       .text(`Start Time: ${session.jam_mulai.toLocaleTimeString()}`)
       .text(`End Time: ${session.jam_selesai.toLocaleTimeString()}`)
       .text(`Duration: ${Math.round(session.durasi / 60000)} minutes`);
    
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('Detection Summary', { underline: true });
    doc.fontSize(12)
       .text(`Total Students: ${session.seat_data.length}`)
       .text(`Average Focus: ${session.detection_summary.average_focus_percentage.toFixed(2)}%`)
       .text(`Peak Focus Duration: ${Math.round(session.detection_summary.peak_focus_time / 1000)} seconds`)
       .text(`Total Detections: ${session.detection_summary.total_detections}`);

    doc.moveDown();

    // Student Details
    doc.fontSize(14).text('Student Performance', { underline: true });
    doc.fontSize(10);
    
    session.seat_data.forEach((student, index) => {
      if (index % 15 === 0 && index > 0) {
        doc.addPage();
      }
      doc.text(`${student.student_id}: ${student.focus_percentage}% focus (${student.final_status})`);
    });

    // Gesture Analysis
    if (session.gesture_analysis && session.gesture_analysis.length > 0) {
      doc.addPage();
      doc.fontSize(14).text('Gesture Analysis', { underline: true });
      doc.fontSize(10);
      
      session.gesture_analysis.forEach((gesture) => {
        doc.text(`${gesture.gesture_type}: ${gesture.total_count} occurrences (${gesture.percentage_of_session.toFixed(1)}% of session)`);
      });
    }

    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export class performance to PDF
router.get('/pdf/class/:classId', auth, async (req, res) => {
  try {
    const { classId } = req.params;
    
    const meetings = await Pertemuan.find({ kelas: classId })
      .populate('mata_kuliah_id', 'nama kode')
      .populate('dosen_id', 'nama_lengkap')
      .sort({ tanggal: -1 });

    if (meetings.length === 0) {
      return res.status(404).json({ message: 'No meetings found for this class' });
    }

    // Create PDF
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="class-report-${classId}.pdf"`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text(`Class Performance Report - ${classId}`, { align: 'center' });
    doc.moveDown();

    // Summary
    const averageFocus = meetings.reduce((sum, m) => sum + m.hasil_akhir_kelas.fokus, 0) / meetings.length;
    const totalStudents = Math.max(...meetings.map(m => m.hasil_akhir_kelas.jumlah_hadir));

    doc.fontSize(14).text('Class Summary', { underline: true });
    doc.fontSize(12)
       .text(`Total Meetings: ${meetings.length}`)
       .text(`Average Focus Rate: ${averageFocus.toFixed(2)}%`)
       .text(`Total Students: ${totalStudents}`)
       .text(`Report Generated: ${new Date().toLocaleDateString()}`);

    doc.moveDown();

    // Meeting Details
    doc.fontSize(14).text('Meeting History', { underline: true });
    doc.fontSize(10);
    
    meetings.forEach((meeting, index) => {
      if (index % 20 === 0 && index > 0) {
        doc.addPage();
      }
      doc.text(`Meeting ${meeting.pertemuan_ke} - ${meeting.mata_kuliah} (${meeting.tanggal.toLocaleDateString()}): ${meeting.hasil_akhir_kelas.fokus.toFixed(1)}% focus`);
    });

    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;