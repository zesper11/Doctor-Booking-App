import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Banner = () => {
  return (
    <section className="appointment-banner relative my-20 flex min-h-[338px] overflow-hidden rounded-lg bg-[#5f6fff] px-8 sm:px-12 md:px-16 lg:px-20">
      <div className="relative z-10 flex max-w-[580px] flex-1 flex-col items-start justify-center py-12">
        <h1 className="max-w-[570px] text-4xl font-semibold leading-[1.2] text-white sm:text-5xl">
          Book Appointment
          <br />
          With 100+ Trusted Doctors
        </h1>
        <Link
          to="/login"
          className="mt-7 rounded-full bg-white px-8 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-100"
        >
          Create account
        </Link>
      </div>

      <div className="flex flex-1 items-end justify-end">
        <img
          src={assets.appointment_img}
          alt="Doctor ready to help with your appointment"
          className="w-full max-w-[440px] self-end object-contain object-bottom"
        />
      </div>
    </section>
  );
};

export default Banner;
