const PROFILE_KEY = "prescripto-patient";

export const readPatientProfile = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "{}");
    return {
      name: typeof saved.name === "string" ? saved.name : "",
      email: typeof saved.email === "string" ? saved.email : "",
      phone: typeof saved.phone === "string" ? saved.phone : "",
    };
  } catch {
    return { name: "", email: "", phone: "" };
  }
};

export const savePatientProfile = (profile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};