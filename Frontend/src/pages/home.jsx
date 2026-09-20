import React from "react";
import Banner from "../components/banner";
import SpecialityMenu from "../components/specialityMenu";
import Header from "../components/header";
import TopDoctors from "../components/topDoctors";

const Home = () => {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  );
};

export default Home;
