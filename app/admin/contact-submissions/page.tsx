"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  admin_notes: string;
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    fetchSubmissions();
  }, [searchTerm, statusFilter, priorityFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : "",
        priority: priorityFilter !== "all" ? priorityFilter : "",
      });

      const response = await fetch(`/api/contact?${params}`);
      const result = await response.json();

      if (response.ok) {
        setSubmissions(result.submissions || []);
      } else {
        setError(result.error || "Failed to fetch submissions");
      }
    } catch (error) {
      setError("Failed to fetch submissions");
      console.error("Fetch submissions error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubmission = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/contact/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          admin_notes: adminNotes,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        fetchSubmissions(); // Refresh the list
        setSelectedSubmission(null);
        setAdminNotes("");
      } else {
        setError(result.error || "Failed to update submission");
      }
    } catch (error) {
      setError("Failed to update submission");
      console.error("Update submission error:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <p>Loading contact submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Contact Submissions</h1>
        <p className="text-gray-600">Manage and respond to contact form submissions</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchSubmissions}>Refresh</Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No contact submissions found</p>
              </CardContent>
            </Card>
          ) : (
            submissions.map((submission) => (
              <Card 
                key={submission.id} 
                className={`cursor-pointer transition-colors ${
                  selectedSubmission?.id === submission.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedSubmission(submission);
                  setAdminNotes(submission.admin_notes || "");
                  setStatus(submission.status);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{submission.name}</h3>
                      <p className="text-sm text-gray-600">{submission.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(submission.priority)}>
                        {submission.priority}
                      </Badge>
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {submission.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(submission.created_at).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Selected Submission Details */}
        <div>
          {selectedSubmission ? (
            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{selectedSubmission.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedSubmission.email}</p>
                </div>
                <div>
                  <Label>Message</Label>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Admin Notes</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this submission..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => updateSubmission(selectedSubmission.id)}
                    className="flex-1"
                  >
                    Update
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Select a submission to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
