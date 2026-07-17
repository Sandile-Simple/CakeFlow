import { BrowserRouter, Routes, Route } from "react-router-dom";
import BookingWizard from "./features/booking/BookingWizard";
import Login from "./features/auth/Login";
import BakerDashboard from "./features/baker/BakerDashboard";
import DecoratorDashboard from "./features/decorator/DecoratorDashboard";
import FrontDeskDashboard from "./features/frontdesk/FrontDeskDashboard";
import ReportsDashboard from "./features/reports/ReportsDashboard";
import AnalyticsDashboard from "./features/analytics/AnalyticsDashboard";
import RegisterCompany from "./features/auth/RegisterCompany";
import VerifyEmail from "./features/auth/VerifyEmail";
import InviteStaff from "./features/frontdesk/InviteStaff";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BookingWizard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/baker" element={<BakerDashboard />} />
        <Route path="/decorator" element={<DecoratorDashboard />} />
        <Route path="/frontdesk" element={<FrontDeskDashboard />} />
        <Route path="/reports" element={<ReportsDashboard />} />
	<Route path="/analytics" element={<AnalyticsDashboard />} />
	<Route path="/register-company" element={<RegisterCompany />} />
	<Route path="/verify-email" element={<VerifyEmail />} />
	<Route path="/invite-staff" element={<InviteStaff />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;