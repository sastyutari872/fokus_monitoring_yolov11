import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BookOpen, User, Calendar, GraduationCap, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface MataKuliah {
  _id: string;
  nama: string;
  kode: string;
  sks: number;
  dosen_id: {
    _id: string;
    nama_lengkap: string;
    email: string;
    departemen: string;
  };
  kelas: string[];
  semester: number;
  deskripsi: string;
  createdAt: string;
}

interface Meeting {
  _id: string;
  tanggal: string;
  pertemuan_ke: number;
  kelas: string;
  hasil_akhir_kelas: {
    fokus: number;
    tidak_fokus: number;
    jumlah_hadir: number;
  };
  topik: string;
}

export default function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [subject, setSubject] = useState<MataKuliah | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSubjectDetail();
      fetchSubjectMeetings();
    }
  }, [id]);

  const fetchSubjectDetail = async () => {
    try {
      const response = await axios.get(`/mata-kuliah/${id}`);
      setSubject(response.data);
    } catch (error) {
      console.error('Error fetching subject detail:', error);
      toast.error('Failed to fetch subject details');
    }
  };

  const fetchSubjectMeetings = async () => {
    try {
      const response = await axios.get('/pertemuan', {
        params: { mata_kuliah_id: id }
      });
      setMeetings(response.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Subject not found</h3>
        <Link to="/subjects" className="text-blue-600 hover:text-blue-500">
          Back to Subjects
        </Link>
      </div>
    );
  }

  const averageFocus = meetings.length > 0 
    ? meetings.reduce((sum, meeting) => sum + meeting.hasil_akhir_kelas.fokus, 0) / meetings.length
    : 0;

  const totalStudents = meetings.length > 0
    ? Math.max(...meetings.map(m => m.hasil_akhir_kelas.jumlah_hadir))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/subjects"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{subject.nama}</h1>
            <p className="text-sm text-gray-500">{subject.kode} - {subject.sks} SKS</p>
          </div>
        </div>
      </div>

      {/* Subject Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{subject.nama}</p>
                  <p className="text-sm text-gray-500">Subject Name</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-5 w-5 text-gray-400 mr-3 flex items-center justify-center">
                  <span className="text-xs font-bold">#</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{subject.kode}</p>
                  <p className="text-sm text-gray-500">Subject Code</p>
                </div>
              </div>
              <div className="flex items-center">
                <GraduationCap className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{subject.sks} SKS</p>
                  <p className="text-sm text-gray-500">Credit Hours</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Semester {subject.semester}</p>
                  <p className="text-sm text-gray-500">Academic Semester</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{subject.dosen_id.nama_lengkap}</p>
                  <p className="text-sm text-gray-500">Full Name</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-5 w-5 text-gray-400 mr-3 flex items-center justify-center">
                  <span className="text-xs">@</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{subject.dosen_id.email}</p>
                  <p className="text-sm text-gray-500">Email</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-5 w-5 text-gray-400 mr-3 flex items-center justify-center">
                  <span className="text-xs">🏢</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{subject.dosen_id.departemen}</p>
                  <p className="text-sm text-gray-500">Department</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {subject.deskripsi && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{subject.deskripsi}</p>
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Classes</h3>
          <div className="flex flex-wrap gap-2">
            {subject.kelas.map((kelas, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {kelas}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Meetings</p>
              <p className="text-2xl font-bold text-gray-900">{meetings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Max Students</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Focus Rate</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(averageFocus)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Classes Count</p>
              <p className="text-2xl font-bold text-gray-900">{subject.kelas.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Meetings</h3>
        </div>
        {meetings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meeting</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Focus Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetings.slice(0, 10).map((meeting) => (
                  <tr key={meeting._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Meeting {meeting.pertemuan_ke}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {meeting.kelas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {meeting.topik || 'No topic'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 max-w-20">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${meeting.hasil_akhir_kelas.fokus}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round(meeting.hasil_akhir_kelas.fokus)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {meeting.hasil_akhir_kelas.jumlah_hadir}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(meeting.tanggal).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings yet</h3>
            <p className="text-gray-500">Meetings for this subject will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}