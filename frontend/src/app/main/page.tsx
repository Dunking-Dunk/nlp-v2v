import { Route, Routes } from "react-router";
import Profile from "./profile/page";
import Setting from "./setting/page";
import Dashboard from "./dashboard/page";
import InterviewsPage from "./interviews/page";
import InterviewDetailPage from "./interviews/[id]/page";
import NewInterviewPage from "./interviews/new/page";
import CandidatesPage from "./candidates/page";
import CandidateDetailPage from "./candidates/[id]/page";
import NewCandidatePage from "./candidates/new/page";
import EditCandidatePage from "./candidates/[id]/edit/page";

export default function Main() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/setting" element={<Setting />} />

      {/* Interview routes with specific routes before dynamic routes */}
      <Route path="/interviews/new" element={<NewInterviewPage />} />
      <Route path="/interviews/:id" element={<InterviewDetailPage />} />
      <Route path="/interviews" element={<InterviewsPage />} />

      {/* Candidate routes with specific routes before dynamic routes */}
      <Route path="/candidates/new" element={<NewCandidatePage />} />
      <Route path="/candidates/:id/edit" element={<EditCandidatePage />} />
      <Route path="/candidates/:id" element={<CandidateDetailPage />} />
      <Route path="/candidates" element={<CandidatesPage />} />
    </Routes>
  );
} 