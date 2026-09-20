import Home from "./pages/home";
import About from "./pages/about";
import Doctors from "./pages/doctors";
import Contact from "./pages/contact";
import Login from "./pages/login";
import Appointment from "./pages/appointment";
import MyAppointments from "./pages/myAppointments";
import Profile from "./pages/profile";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

const App = () => {
  return (
    <div className="mx-4 sm:mx-[10%]">
      <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/doctors/" element={<Doctors />} />
        <Route path="/doctors/:specialty" element={<Doctors />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/appointment/:docId" element={<Appointment />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
