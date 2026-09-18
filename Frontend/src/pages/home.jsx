import React from "react";
import Header from "../components/header";
import SpecialityMenu from "../components/specialityMenu";
import TopDoctors from "../components/topDoctors";

const Home = () => {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
    </div>
  );
};

export default Home;
