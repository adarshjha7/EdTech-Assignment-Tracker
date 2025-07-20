import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../hooks/useApi";
import { Assignment } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Upload,
  Calendar,
  CheckCircle,
  Clock,
  LogOut,
  FileText,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { get, postFormData } = useApi();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<{ [key: number]: any }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  const [submissionForm, setSubmissionForm] = useState({
    content: "",
    file: null as File | null,
  });

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await get("/api/assignments");
      setAssignments(data);

      // Load existing submissions for each assignment
      const submissionPromises = data.map(async (assignment: Assignment) => {
        try {
          const submission = await get(
            `/api/assignments/${assignment.id}/my-submission`,
          );
          return { [assignment.id]: submission };
        } catch (error) {
          return { [assignment.id]: null };
        }
      });

      const submissionResults = await Promise.all(submissionPromises);
      const submissionsMap = submissionResults.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {},
      );
      setSubmissions(submissionsMap);
    } catch (error) {
      console.error("Failed to load assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const openSubmissionDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    const existingSubmission = submissions[assignment.id];
    if (existingSubmission) {
      setSubmissionForm({
        content: existingSubmission.content,
        file: null,
      });
    } else {
      setSubmissionForm({ content: "", file: null });
    }
    setDialogOpen(true);
  };

  const submitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("content", submissionForm.content);
      if (submissionForm.file) {
        formData.append("file", submissionForm.file);
      }

      await postFormData(
        `/api/assignments/${selectedAssignment.id}/submit`,
        formData,
      );
      setDialogOpen(false);
      setSubmissionForm({ content: "", file: null });
      loadAssignments(); // Reload to get updated submission status
    } catch (error) {
      console.error("Failed to submit assignment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' hh:mm a");
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const isSubmitted = (assignmentId: number) => {
    return (
      submissions[assignmentId] !== null &&
      submissions[assignmentId] !== undefined
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingAssignments = assignments.filter(
    (a) => !isSubmitted(a.id) && !isOverdue(a.due_date),
  );
  const submittedAssignments = assignments.filter((a) => isSubmitted(a.id));
  const overdueAssignments = assignments.filter(
    (a) => !isSubmitted(a.id) && isOverdue(a.due_date),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">EduTracker</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <Badge variant="outline">Student</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Assignments
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingAssignments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Submitted</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {submittedAssignments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overdueAssignments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Sections */}
        {overdueAssignments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-red-700 mb-4">
              Overdue Assignments
            </h2>
            <div className="grid gap-4">
              {overdueAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  isSubmitted={isSubmitted(assignment.id)}
                  isOverdue={true}
                  onSubmit={() => openSubmissionDialog(assignment)}
                />
              ))}
            </div>
          </div>
        )}

        {pendingAssignments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Assignments
            </h2>
            <div className="grid gap-4">
              {pendingAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  isSubmitted={isSubmitted(assignment.id)}
                  isOverdue={false}
                  onSubmit={() => openSubmissionDialog(assignment)}
                />
              ))}
            </div>
          </div>
        )}

        {submittedAssignments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-green-700 mb-4">
              Submitted Assignments
            </h2>
            <div className="grid gap-4">
              {submittedAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  isSubmitted={true}
                  isOverdue={false}
                  onSubmit={() => openSubmissionDialog(assignment)}
                />
              ))}
            </div>
          </div>
        )}

        {assignments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No assignments available
              </h3>
              <p className="text-gray-600">
                Check back later for new assignments from your teachers.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Submission Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={submitAssignment}>
            <DialogHeader>
              <DialogTitle>
                {isSubmitted(selectedAssignment?.id || 0)
                  ? "Update Submission"
                  : "Submit Assignment"}
              </DialogTitle>
              <DialogDescription>{selectedAssignment?.title}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="content">Your Response</Label>
                <Textarea
                  id="content"
                  value={submissionForm.content}
                  onChange={(e) =>
                    setSubmissionForm({
                      ...submissionForm,
                      content: e.target.value,
                    })
                  }
                  placeholder="Enter your assignment response here..."
                  rows={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Upload File (Optional)</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) =>
                    setSubmissionForm({
                      ...submissionForm,
                      file: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting
                  ? "Submitting..."
                  : isSubmitted(selectedAssignment?.id || 0)
                    ? "Update Submission"
                    : "Submit Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Assignment Card Component
const AssignmentCard: React.FC<{
  assignment: Assignment;
  isSubmitted: boolean;
  isOverdue: boolean;
  onSubmit: () => void;
}> = ({ assignment, isSubmitted, isOverdue, onSubmit }) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' hh:mm a");
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${
        isOverdue ? "border-red-200" : isSubmitted ? "border-green-200" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900 mr-3">
                {assignment.title}
              </h3>
              {isSubmitted && (
                <Badge className="bg-green-100 text-green-800">Submitted</Badge>
              )}
              {isOverdue && !isSubmitted && (
                <Badge variant="destructive">Overdue</Badge>
              )}
            </div>
            <p className="text-gray-600 mb-3">{assignment.description}</p>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Calendar className="h-4 w-4 mr-1" />
              Due: {formatDate(assignment.due_date)}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <FileText className="h-4 w-4 mr-1" />
              Teacher: {assignment.teacher_name}
            </div>
          </div>
          <div className="ml-4">
            <Button
              variant={isSubmitted ? "outline" : "default"}
              size="sm"
              onClick={onSubmit}
              className={!isSubmitted ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isSubmitted ? "Update" : "Submit"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentDashboard;
