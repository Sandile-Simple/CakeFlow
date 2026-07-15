import { BrowserRouter, Routes, Route } from "react-router-dom";
import BookingForm from "./features/booking/BookingForm";
import Login from "./features/auth/Login";
import BakerDashboard from "./features/baker/BakerDashboard";
import DecoratorDashboard from "./features/decorator/DecoratorDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BookingForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/baker" element={<BakerDashboard />} />
        <Route path="/decorator" element={<DecoratorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;