import React from "react";
import { specialityData } from "../assets/assets.js";

const SpecialityMenu = () => {
  return (
    <section className="mx-auto flex max-w-5xl flex-col px-4 py-14 text-center">
      <h3 className="text-3xl font-medium leading-tight text-gray-900">
        Find by Speciality
      </h3>
      <p className="mx-auto mt-5 max-w-md text-sm leading-5 text-gray-700">
        Simply browse through our extensive list of trusted doctors, schedule
        your appointment hassle-free.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-8 md:gap-x-5">
        {specialityData.map((spe) => (
          <div
            key={spe.speciality}
            className="flex cursor-pointer flex-col items-center gap-3 text-center transition-transform duration-200 hover:-translate-y-1"
          >
            <img
              src={spe.image}
              alt={`${spe.speciality} speciality`}
              className="h-24 w-24 object-contain"
            />
            <p className="text-xs text-gray-900">{spe.speciality}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SpecialityMenu;
