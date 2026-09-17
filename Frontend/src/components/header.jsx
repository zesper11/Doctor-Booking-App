import { assets } from "../assets/assets";

const Header = () => {
  return (
    <header className="flex min-h-[500px] flex-col overflow-hidden rounded-lg bg-[#5f6fff] px-6 sm:px-10 md:flex-row md:px-16 lg:px-20">
      <div className="flex flex-1 flex-col items-start justify-center gap-6 py-12 md:py-16">
        <h1 className="max-w-[520px] text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Book Appointment
          <br />
          With Trusted Doctors
        </h1>

        <div className="flex items-center gap-3">
          <img
            src={assets.group_profiles}
            alt="Patients who use the service"
            className="w-28"
          />
          <p className="max-w-[315px] text-sm font-light leading-5 text-white">
            Simply browse through our extensive list of trusted doctors,
            <br className="hidden sm:block" />
            schedule your appointment hassle-free.
          </p>
        </div>

        <button className="flex cursor-pointer items-center gap-3 rounded-full bg-white px-8 py-3 text-sm font-light text-gray-600">
          <span>Book appointment</span>
          <img src={assets.arrow_icon} alt="" className="w-3" />
        </button>
      </div>

      <div className="relative flex flex-1 items-end justify-center pt-8 md:justify-end md:pt-0">
        <img
          src={assets.header_img}
          alt="Trusted doctors"
          className="w-full max-w-[560px] object-contain object-bottom"
        />
      </div>
    </header>
  );
};

export default Header;
