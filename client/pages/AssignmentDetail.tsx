import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../hooks/useApi";
import { Assignment, Submission } from "@shared/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Users,
  BookOpen,
} from "lucide-react";
import { format } from "date-fns";

const AssignmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { get } = useApi();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAssignmentDetails();
    }
  }, [id]);

  const loadAssignmentDetails = async () => {
    try {
      const assignmentData = await get(`/api/assignments/${id}`);
      setAssignment(assignmentData);

      if (user?.role === "teacher") {
        const submissionsData = await get(`/api/assignments/${id}/submissions`);
        setSubmissions(submissionsData);
      }
    } catch (error) {
      console.error("Failed to load assignment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' hh:mm a");
  };

  const downloadFile = (filePath: string, studentName: string) => {
    const fileName = filePath.split("/").pop() || "file";
    const link = document.createElement("a");
    link.href = `/${filePath}`;
    link.download = `${studentName}_${fileName}`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Assignment not found
            </h2>
            <p className="text-gray-600 mb-4">
              The assignment you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Assignment Details
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignment Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                <CardDescription className="mt-2">
                  Created by {assignment.teacher_name}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Due: {formatDate(assignment.due_date)}
                </div>
                {new Date(assignment.due_date) < new Date() && (
                  <Badge variant="destructive">Overdue</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {assignment.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions (Teacher only) */}
        {user?.role === "teacher" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Submissions ({submissions.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No submissions yet
                  </h3>
                  <p className="text-gray-600">
                    Students haven't submitted their assignments yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <Card
                      key={submission.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {submission.student_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {submission.student_email}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Submitted: {formatDate(submission.submitted_at)}
                            </p>
                          </div>
                          {submission.file_path && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                downloadFile(
                                  submission.file_path!,
                                  submission.student_name!,
                                )
                              }
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download File
                            </Button>
                          )}
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">
                            Response:
                          </h5>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {submission.content}
                          </p>
                        </div>
                        {submission.grade !== null && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-green-800">
                                Grade: {submission.grade}/100
                              </span>
                            </div>
                            {submission.feedback && (
                              <p className="text-green-700 mt-2">
                                Feedback: {submission.feedback}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AssignmentDetail;
